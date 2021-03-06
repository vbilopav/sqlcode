﻿using AutoMapper;
using LiteDB;
using sqlcode.Scripting;

namespace sqlcode.LocalStorage
{
    public class ScriptDocumentModel
    {
        // 
        // needed for LiteDB document database for indexing composite key
        //
        [BsonId]
        public ScriptKeyModel Key { get; set; }

        public string Title { get; set; }
        public string ViewState { get; set; }
        public string Content { get; set; }

        public ScriptViewModel MapTo() => Mapper.Map<ScriptDocumentModel, ScriptViewModel>(this);
        public static ScriptDocumentModel MapFrom(ScriptViewModel viewModel) => Mapper.Map<ScriptViewModel, ScriptDocumentModel>(viewModel);
    }
}