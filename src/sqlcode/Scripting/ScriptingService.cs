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
        private readonly IDatabaseAdapter _db;

        private readonly ScriptItemSpecs _specs;

        public ScriptingService(IDatabaseAdapter db, ScriptItemSpecs specs)
        {
            _db = db;
            _specs = specs;
        }

        public bool AddOrUpdate(ScriptViewModel model) => _db.Upsert(ScriptDocumentModel.MapFrom(model));

        public ScriptViewModel RetreiveByKey(ScriptKeyModel key) => _db.FirstOrDefault(_specs.GetKeySpec(key))?.MapToScriptViewModel();

        public IEnumerable<string> GetAllTitles(string type) => _db.FindBy(_specs.GetTypeSpec(type)).Select(item => item.Title);

        public IEnumerable<ScriptTitleViewModel> GetAllItems(string type) => 
            _db.FindBy(_specs.GetTypeSpec(type)).Select(item => new ScriptTitleViewModel {
                Id = item.Key.Id,
                Type = item.Key.Type,
                Title = item.Title
            });

        public bool UpdateTitle(ScriptKeyModel key, string title)
        {
            var result = _db.FirstOrDefault(_specs.GetKeySpec(key));
            if (result == default(ScriptDocumentModel))
            {
                return false;
            }
            result.Title = title;
            return _db.Update(result);
        } 
    }
}