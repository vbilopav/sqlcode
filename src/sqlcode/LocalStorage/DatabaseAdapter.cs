using LiteDB;
using Microsoft.Extensions.Logging;
using System;
using System.Linq.Expressions;

namespace sqlcode.LocalStorage
{
    public interface IDatabaseAdapter
    {
        DatabaseAdapter Upsert<T>(T model);
    }

    public class DatabaseAdapter : IDisposable, IDatabaseAdapter
    {
        private readonly LiteDatabase _db;

        public DatabaseAdapter(
            string connectionString, ILogger log, 
            string logLevel="ALL", 
            string logType="Information"
        )
        {
            var logLevelValue = (byte?)typeof(Logger).GetField(logLevel).GetValue(null);
            LogLevel? logTypeValue = null;
            if (Enum.IsDefined(typeof(LogLevel), logType))
            {
                logTypeValue = (LogLevel) Enum.Parse(typeof(LogLevel), logType);
            }
            var logger = logLevelValue != null && logTypeValue != null ? 
                new Logger((byte)logLevelValue, message => log.Log((LogLevel)logTypeValue, message)) : 
                null;
            _db = new LiteDatabase(connectionString, log: logger);
        }

        public DatabaseAdapter EnsureIndexes<T, TK>(Expression<Func<T, TK>> property, bool unique = false)
        {
            var name = typeof(T).Name;
            var collection = _db.GetCollection<T>(name);
            collection.EnsureIndex(property, unique);
            return this;
        }

        public DatabaseAdapter Upsert<T>(T model)
        {
            var name = typeof(T).Name;
            var collection = _db.GetCollection<T>(name);
            collection.Upsert(model);
            return this;
        }

        public DatabaseAdapter Shrink()
        {
            _db.Shrink();
            return this;
        }

        public void Dispose()
        {
            _db?.Dispose();
        }
    }
}
