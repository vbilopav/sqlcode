using Microsoft.Extensions.DependencyInjection;

namespace sqlcode.Scripting
{
    public static class ConfigureServices
    {
        public static IServiceCollection AddScriptingService(this IServiceCollection services) => 
            services.AddTransient<IScriptingService, ScriptingService>();
    }
}
