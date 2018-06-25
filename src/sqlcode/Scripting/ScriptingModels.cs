namespace sqlcode.Scripting
{
    public class ScriptKeyModel
    {
        public uint Id { get; set; }
        public string Type { get; set; }
    }

    public class ScriptViewModel : ScriptKeyModel
    {
        public string Title { get; set; }
        public string ViewState { get; set; }
        public string Content { get; set; }
    }
}