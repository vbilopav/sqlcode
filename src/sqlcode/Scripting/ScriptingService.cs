using System.Linq;
using System.Collections.Generic;

namespace sqlcode.Scripting
{
    using LocalStorage;

    public interface IScriptingService
    {
        bool AddOrUpdate(ScriptViewModel model);
        ScriptViewModel RetreiveByKey(ScriptKeyModel key);
        IEnumerable<string> GetTitles(string type);
    }

    public class ScriptingService : IScriptingService
    {
        private readonly IDatabaseAdapter _db;

        public ScriptingService(IDatabaseAdapter db) => _db = db;

        public bool AddOrUpdate(ScriptViewModel model) => _db.Upsert(ScriptDocumentModel.MapFrom(model));

        public ScriptViewModel RetreiveByKey(ScriptKeyModel key) => 
            _db.FirstOrDefault<ScriptDocumentModel>(item => item.Key.Id == key.Id && item.Key.Type == key.Type)?.MapToScriptViewModel();

        public IEnumerable<string> GetTitles(string type) => 
            _db.FindBy<ScriptDocumentModel>(item => item.Key.Type == type).Select(item => item.Title);
    }
}