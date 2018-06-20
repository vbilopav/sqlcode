using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using Swashbuckle.AspNetCore.Swagger;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using System.Globalization;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace sqlcode
{
    public class Program
    {
        public static void Main(string[] args) => CreateWebHostBuilder(args).Build().Run();
        public static IWebHostBuilder CreateWebHostBuilder(string[] args) => WebHost.CreateDefaultBuilder(args).UseStartup<Startup>();
    }

    public class AppConfig
    {
        public string SwaggerTitle { get; set; } = "sqlcode API";
        public string SwaggerVersion { get; set; } = "v1";
        public string SwaggerEndpoint { get; set; } = $"/swagger/v1/swagger.json";
        public string DiagnosticPath { get; set; } = "/diagnostic";
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
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc(appConfig.SwaggerVersion,
                    new Info
                    {
                        Title = appConfig.SwaggerTitle,
                        Version = appConfig.SwaggerVersion
                    }
                );
            });

            //services.AddTransient()
        }


        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage().UseMvc().UseDefaultFiles().UseStaticFiles();

                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint(
                        appConfig.SwaggerEndpoint,
                        $"{appConfig.SwaggerTitle} {appConfig.SwaggerVersion}"
                    );
                });
                app.UseDiagnosticPage(env, this.services, config, appConfig.DiagnosticPath,
                    Tuple.Create("AppConfig", appConfig as object));
            }
            else
            {
                throw new NotImplementedException("Not ready for production yet!");
            }
        }
    }

    public static class DiagnosticPageExtensions
    {
        public static IApplicationBuilder UseDiagnosticPage(
            this IApplicationBuilder app,
            IHostingEnvironment envirment,
            IServiceCollection services,
            IConfiguration config,
            string path = "/diagnostic",
            Tuple<string, object> extraInfo = null)
        {
            app.Map(path, builder => builder.Run(async context =>
            {
                context.Response.ContentType = "application/json";

                var result = new Dictionary<string, object>
                {
                    { extraInfo?.Item1 ?? "extraInfo is not provided", extraInfo?.Item2 ?? "-" },
                    { "HostingEnvironment", envirment },
                    { "Actions", app.ApplicationServices
                        .GetRequiredService<IActionDescriptorCollectionProvider>()
                        .ActionDescriptors
                        .Items
                        .Select(item => new { name = item.DisplayName, item.AttributeRouteInfo.Template }) },
                    { "Culture", new { CultureInfo.CurrentCulture, CultureInfo.CurrentUICulture  } },
                    { "Services", services.
                        Where(item => !item.ServiceType.FullName.StartsWith("Microsoft") && !item.ServiceType.FullName.StartsWith("System")).
                        Select(item => new
                        {
                            lifetime = item.Lifetime.ToString(),
                            type = item.ServiceType.FullName,
                            implementation = item.ImplementationType?.FullName
                        })
                    },
                    { "Configuration", config.AsEnumerable() }
                };
                await context.Response.WriteAsync(JsonConvert.SerializeObject(result, Formatting.Indented));
            }));
            return app;
        }
    }

}
