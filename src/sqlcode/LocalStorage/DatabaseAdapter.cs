using LiteDB;
using Microsoft.Extensions.Logging;
using System;
using System.Linq.Expressions;

namespace sqlcode.LocalStorage
{
    public interface IDatabaseAdapter
    {
        DatabaseAdapter Upsert<T>(T model);
        T FirstOrDefault<T>(Expression<Func<T, bool>> predicate);
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
            byte logLevelValue = 0;
            foreach (var item in logLevel.Split(',', ';', ' '))
            {
                var value = (byte?)typeof(Logger).GetField(item).GetValue(null);
                if (value != null)
                {
                    logLevelValue = (byte) (logLevelValue | (byte) value);
                }
            }

            LogLevel ? logTypeValue = null;
            if (Enum.IsDefined(typeof(LogLevel), logType))
            {
                logTypeValue = (LogLevel) Enum.Parse(typeof(LogLevel), logType);
            }

            var logger = logLevelValue != 0 && logTypeValue != null ? 
                new Logger(logLevelValue, message => log.Log((LogLevel)logTypeValue, message)) : 
                null;

            _db = new LiteDatabase(connectionString, log: logger);
        }

        private LiteCollection<T> GetCollection<T>() => _db.GetCollection<T>(typeof(T).Name);

        public DatabaseAdapter EnsureIndexes<T, TK>(Expression<Func<T, TK>> property, bool unique=false)
        {
            var collection = GetCollection<T>();
            collection.EnsureIndex(property, unique);
            return this;
        }

        public DatabaseAdapter Upsert<T>(T model)
        {
            var collection = GetCollection<T>();
            collection.Upsert(model);
            return this;
        }

        public T FirstOrDefault<T>(Expression<Func<T, bool>> predicate)
        {
            var collection = GetCollection<T>();
            var result = collection.FindOne(predicate);
            if (result == null)
            {
                return default(T);
            }
            return result;
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
