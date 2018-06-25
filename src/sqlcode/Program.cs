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
        public static void Main(string[] args) => CreateWebHostBuilder(args).Build().Run();       
        public static IWebHostBuilder CreateWebHostBuilder(string[] args) => WebHost.CreateDefaultBuilder(args).UseStartup<Startup>();
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
                .AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .Services
                .AddRouting(options => options.LowercaseUrls = true)
                .AddAutoMapper(typeof(ScriptDocumentModel))
                .AddLocalDatabase(_appConfig)
                .AddScriptingService();
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
            }
            else
            {
                throw new NotImplementedException("Not ready for production yet!");
            }

            if (_appConfig.DiagnosticPath != null)
            {
                app.UseDiagnosticPage(env, this._services, _config, _appConfig.DiagnosticPath, ("AppConfig", _appConfig as object));
            }
        }
    }
}
