using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.Swagger;

namespace sqlcode.Sys
{
    public static class SwaggerService
    {
        public static void ConfigureSwaggerService(this IServiceCollection services, AppConfig appConfig)
        {
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
        }

        public static void ConfigureSwagger(this IApplicationBuilder app, AppConfig appConfig)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint(
                    appConfig.SwaggerEndpoint,
                    $"{appConfig.SwaggerTitle} {appConfig.SwaggerVersion}"
                );
            });
        }
    }
}
