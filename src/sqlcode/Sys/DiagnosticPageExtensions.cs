using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace sqlcode.Sys
{
    public static class DiagnosticPageExtensions
    {
        public static IApplicationBuilder UseDiagnosticPage(
            this IApplicationBuilder app,
            IHostingEnvironment envirment,
            IServiceCollection services,
            IConfiguration config,
            string path,
            (string key, object value) extra
        )
        {
            app.Map(path, builder => builder.Run(async context =>
            {
                context.Response.ContentType = "application/json";
                var result = new List<KeyValuePair<string, object>>
                {
                    new KeyValuePair<string, object>("HostingEnvironment", envirment),
                    new KeyValuePair<string, object>("Actions",
                        app.ApplicationServices
                            .GetRequiredService<IActionDescriptorCollectionProvider>()
                            .ActionDescriptors
                            .Items
                            .Select(item => new { name = item.DisplayName, item.AttributeRouteInfo.Template })),
                    new KeyValuePair<string, object>("Culture", new {CultureInfo.CurrentCulture, CultureInfo.CurrentUICulture}),
                    new KeyValuePair<string, object>("Services", services.
                        //Where(item => !item.ServiceType.FullName.StartsWith("Microsoft") && !item.ServiceType.FullName.StartsWith("System")).
                        Select(item => new
                        {
                            lifetime = item.Lifetime.ToString(),
                            type = item.ServiceType.FullName,
                            implementation = item.ImplementationType?.FullName
                        })),
                    new KeyValuePair<string, object>("Configuration", config.AsEnumerable()),
                };
                if (extra.key != null)
                {
                    result.Insert(0, new KeyValuePair<string, object>(extra.key, extra.value));
                }

                await context.Response.WriteAsync(JsonConvert.SerializeObject(result, Formatting.Indented));
            }));
            return app;
        }
    }
}
