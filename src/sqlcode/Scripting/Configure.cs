using Microsoft.Extensions.DependencyInjection;

namespace sqlcode.Scripting
{
    public static class Configure
    {
        public static IServiceCollection AddScriptingService(this IServiceCollection services) => services
                .AddTransient<IScriptingService, ScriptingService>()
                .AddTransient<ScriptItemSpecs, ScriptItemSpecs>();
    }
}
