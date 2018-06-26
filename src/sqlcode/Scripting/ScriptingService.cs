namespace sqlcode.Scripting
{
    using LocalStorage;

    public interface IScriptingService
    {
        void AddOrUpdate(ScriptViewModel model);
        ScriptViewModel RetreiveByKey(ScriptKeyModel key);
    }

    public class ScriptingService : IScriptingService
    {
        private readonly IDatabaseAdapter _db;

        public ScriptingService(IDatabaseAdapter db) => _db = db;
        
        public void AddOrUpdate(ScriptViewModel model) => _db.Upsert(ScriptDocumentModel.MapFrom(model));

        public ScriptViewModel RetreiveByKey(ScriptKeyModel key)
        {
            var result = _db.FirstOrDefault<ScriptDocumentModel>(item => item.Key.Id == key.Id && item.Key.Type == key.Type);
            return result?.MapToScriptViewModel();
        }
    }
}