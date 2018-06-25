using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace sqlcode.LocalStorage
{
    using Scripting;

    public static class ConfigureServices
    {
        public static IServiceCollection AddLocalDatabase(this IServiceCollection services, AppConfig config)
        {
            services.AddTransient<IDatabaseAdapter>(context =>
            {
                var loggerFactory = context.GetService(typeof(ILoggerFactory)) as LoggerFactory;
                return new DatabaseAdapter(
                    config.LocalStoreConnectionString,
                    loggerFactory?.CreateLogger(nameof(DatabaseAdapter)),
                    config.LocalStoreLogLevel,
                    config.LocalStoreLogType
                );
            });

            var provider = services.BuildServiceProvider();
            using (var db = provider.GetService(typeof(IDatabaseAdapter)) as DatabaseAdapter)
            {
                db?
                    .EnsureIndexes<ScriptDocumentModel, ScriptKeyModel>(item => item.Key, unique: true)
                    .Shrink();
            }

            return services;
        }
    }
}
