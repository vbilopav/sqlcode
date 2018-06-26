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
        public static void Main(string[] args) => 
            WebHost.CreateDefaultBuilder(args).UseStartup<Startup>().Build().Run();
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
        private IServiceCollection _services;
        private readonly IConfiguration _config;
        private readonly AppConfig _appConfig;

        public Startup(IConfiguration config)
        {
            _config = config;
            _appConfig = new AppConfig();
            config.Bind("App", _appConfig);
        }
        
        public void ConfigureServices(IServiceCollection services)
        {
            this._services = services;
            services
                .AddRouting(options => options.LowercaseUrls = true)
                .AddLocalDatabase(_appConfig)
                .AddScriptingService()
                .AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            ConfigureAutoMapper();
        }

        public static void ConfigureAutoMapper()
        {
            Mapper.Initialize(c => {
                c.CreateMap<ScriptViewModel, ScriptDocumentModel>().ForMember(
                        dest => dest.Key, 
                        opt => opt.MapFrom(src => new ScriptKeyModel{Id = src.Id, Type = src.Type})
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

                if (_appConfig.DiagnosticPath != null)
                {
                    app.UseDiagnosticPage(
                        env,
                        _services,
                        _config,
                        _appConfig.DiagnosticPath,
                        ("AppConfig", _appConfig as object),
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
