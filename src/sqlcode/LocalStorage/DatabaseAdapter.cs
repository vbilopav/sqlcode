﻿using LiteDB;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace sqlcode.LocalStorage
{
    public interface IDatabaseAdapter
    {
        bool Upsert<T>(T model);
        T FirstOrDefault<T>(Expression<Func<T, bool>> predicate);
        IEnumerable<T> FindBy<T>(Expression<Func<T, bool>> predicate);
        bool Update<T>(T model);
    }

    public class DatabaseAdapter : IDisposable, IDatabaseAdapter
    {
        private readonly LiteDatabase db;

        public DatabaseAdapter(
            string connectionString, 
            ILogger log, 
            string logLevel="ALL", 
            string logType="Information"
        )
        {
            byte logLevelValue = 0;
            foreach (var item in (logLevel??"").Split(',', ';', ' '))
            {
                if (string.IsNullOrEmpty(item))
                {
                    continue;
                }
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

            db = new LiteDatabase(connectionString, log: logger);
        }

        private LiteCollection<T> GetCollection<T>() => db.GetCollection<T>(typeof(T).Name);

        public bool Upsert<T>(T model) => GetCollection<T>().Upsert(model);
        
        public bool Update<T>(T model) => GetCollection<T>().Update(model);

        public T FirstOrDefault<T>(Expression<Func<T, bool>> predicate)
        {
            var result = GetCollection<T>().FindOne(predicate);
            if (result == null)
            {
                return default(T);
            }
            return result;
        }

        public IEnumerable<T> FindBy<T>(Expression<Func<T, bool>> predicate) => 
            GetCollection<T>().Find(predicate);

        
        public DatabaseAdapter EnsureIndex<T, TK>(Expression<Func<T, TK>> property, bool unique = false)
        {
            GetCollection<T>().EnsureIndex(property, unique);
            return this;
        }

        public DatabaseAdapter Shrink()
        {
            db.Shrink();
            return this;
        }

        public void Dispose()
        {
            db?.Dispose();
        }
    }
}
