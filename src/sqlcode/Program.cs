using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using AutoMapper;

namespace sqlcode
{
    using Scripting;
    using LocalStorage;

    public class Program
    {
        public static void Main(string[] args) => WebHost.CreateDefaultBuilder(args).UseStartup<Startup>().Build().Run();
    }

    public class AppConfig
    {
        public string DiagnosticPath { get; set; } = null;
        public string LocalStoreConnectionString { get; set; } = "local.db";
        public string LocalStoreLogLevel { get; set; } = "NONE"; // NONE, ERROR, RECOVERY, COMMAND, LOCK, QUERY, JOURNAL, CACHE, DISK, FULL
        public string LocalStoreLogType { get; set; } = "Information";
    }

    public class Startup
    {
        private IServiceCollection services;
        private readonly IConfiguration config;
        private readonly AppConfig appConfig;

        public Startup(IConfiguration config)
        {
            this.config = config;
            appConfig = new AppConfig();
            config.Bind("App", appConfig);
        }
        
        public void ConfigureServices(IServiceCollection services)
        {
            this.services = services;
            services
                .AddRouting(options => options.LowercaseUrls = true)
                .AddLocalDatabase(appConfig)
                .AddScriptingService()
                .AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            ConfigureAutoMapper();
        }

        public static void ConfigureAutoMapper()
        {
            Mapper.Initialize(ctx => {
                ctx.CreateMap<ScriptViewModel, ScriptDocumentModel>().ForMember(
                    dest => dest.Key, 
                    opt => opt.MapFrom(src => new ScriptKeyModel{Id = src.Id, Type = src.Type})
                );
                ctx.CreateMap<ScriptDocumentModel, ScriptViewModel>().ForMember(
                    dest => dest.Id,
                    opt => opt.MapFrom(src => src.Key.Id)
                ).ForMember(
                    dest => dest.Type,
                    opt => opt.MapFrom(src => src.Key.Type)
                );
            });
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app
                    .UseDeveloperExceptionPage()
                    .UseMvc()
                    .UseDefaultFiles()
                    .UseStaticFiles();

                if (appConfig.DiagnosticPath != null)
                {
                    app.UseDiagnosticPage(
                        env,
                        services,
                        config,
                        appConfig.DiagnosticPath,
                        ("AppConfig", appConfig as object),
                        includeSystemServices: false
                   );
                }
            }
            else
            {
                throw new NotImplementedException("Not ready for production yet!");
            }
        }
    }
}
