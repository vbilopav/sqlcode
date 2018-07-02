using System.Linq;
using System.Collections.Generic;

namespace sqlcode.Scripting
{
    using System;
    using System.Linq.Expressions;
    using LocalStorage;

    public interface IScriptingService
    {
        bool AddOrUpdate(ScriptViewModel model);
        ScriptViewModel RetreiveByKey(ScriptKeyModel key);
        IEnumerable<string> GetAllTitles(string type);
        bool UpdateTitle(ScriptKeyModel key, string title);
        IEnumerable<ScriptTitleViewModel> GetAllItems(string type);
    }

    public class ScriptItemSpecs
    {
        public Expression<Func<ScriptDocumentModel, bool>> GetKeySpec(ScriptKeyModel key) => 
            item => item.Key.Id == key.Id && item.Key.Type == key.Type;

        public Expression<Func<ScriptDocumentModel, bool>> GetTypeSpec(string type) => 
            item => item.Key.Type == type;
    }

    public class ScriptingService : IScriptingService
    {
        private static Object titlesLock = new Object();

        private readonly IDatabaseAdapter db;

        private readonly ScriptItemSpecs specs;

        public ScriptingService(IDatabaseAdapter db, ScriptItemSpecs specs)
        {
            this.db = db;
            this.specs = specs;
        }

        public bool AddOrUpdate(ScriptViewModel model) => db.Upsert(ScriptDocumentModel.MapFrom(model));

        public ScriptViewModel RetreiveByKey(ScriptKeyModel key) => db.FirstOrDefault(specs.GetKeySpec(key))?.MapTo();

        public IEnumerable<string> GetAllTitles(string type)
        {
            lock(titlesLock)
            {
                return db.FindBy(specs.GetTypeSpec(type)).Select(item => item.Title);
            }
        }

        public IEnumerable<ScriptTitleViewModel> GetAllItems(string type) => 
            db.FindBy(specs.GetTypeSpec(type)).Select(item => new ScriptTitleViewModel {
                Id = item.Key.Id,
                Type = item.Key.Type,
                Title = item.Title
            });

        public bool UpdateTitle(ScriptKeyModel key, string title)
        {
            lock(titlesLock)
            {
                var result = db.FirstOrDefault(specs.GetKeySpec(key));
                if (result == default(ScriptDocumentModel))
                {
                    return false;
                }
                result.Title = title;
                return db.Update(result);
            }
        } 
    }
}