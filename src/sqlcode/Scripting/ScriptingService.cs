namespace sqlcode.Scripting
{
    using AutoMapper;
    using LocalStorage;

    public interface IScriptingService
    {
        void AddOrUpdate(ScriptViewModel model);
    }

    public class ScriptingService : IScriptingService
    {
        private readonly IDatabaseAdapter _db;

        public ScriptingService(IDatabaseAdapter db) => _db = db;
        
        public void AddOrUpdate(ScriptViewModel model) => _db.Upsert(ScriptDocumentModel.Map(model));
    }
}