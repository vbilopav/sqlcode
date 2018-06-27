namespace sqlcode.Scripting
{
    public class ScriptKeyModel
    {
        public uint Id { get; set; }
        public string Type { get; set; }
    }

    public class ScriptTitleViewModel : ScriptKeyModel
    {
        public string Title { get; set; }
    }

    public class ScriptViewModel : ScriptTitleViewModel
    {
        public string ViewState { get; set; }
        public string Content { get; set; }
    }
}