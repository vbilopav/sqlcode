namespace sqlcode.Scripting
{
    using LocalStorage;

    public interface IScriptingService
    {
        void Upsert(ScriptViewModel model);
    }

    public class ScriptingService : IScriptingService
    {
        private readonly IDatabaseAdapter _db;

        public ScriptingService(IDatabaseAdapter db) => _db = db;
        public void Upsert(ScriptViewModel model) => _db.Upsert(ScriptDocumentModel.Create(model));
    }
}