using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace sqlcode.Sys
{
    public class AppConfig
    {
        public string SwaggerTitle { get; set; } = "sqlcode API";
        public string SwaggerVersion { get; set; } = "v1";
        public string SwaggerEndpoint { get; set; } = $"/swagger/v1/swagger.json";
        public string DiagnosticPath { get; set; } = "/diagnostic";
    }
}
