using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace sqlcode
{
    using Sys;

    public class Program
    {
        public static void Main(string[] args) => CreateWebHostBuilder(args).Build().Run();
        public static IWebHostBuilder CreateWebHostBuilder(string[] args) => DefaultHostBuilder.CreateDefaultBuilder(args).UseStartup<Startup>();       
    }

    public class Startup
    {
        private IServiceCollection services;
        private readonly IConfiguration config;
        private AppConfig appConfig;

        public Startup(IConfiguration config)
        {
            this.config = config;
            appConfig = new AppConfig();
            config.Bind("app", appConfig);
        }
        
        public void ConfigureServices(IServiceCollection services)
        {
            this.services = services;
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
            services.ConfigureSwaggerService(appConfig);
            //services.AddTransient()
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage().UseMvc().UseDefaultFiles().UseStaticFiles();
                app.ConfigureSwagger(appConfig);                
                app.UseDiagnosticPage(env, this.services, config, appConfig.DiagnosticPath, ("AppConfig", appConfig as object));
            }
            else
            {
                throw new NotImplementedException("Not ready for production yet!");
            }
        }
    }
}
