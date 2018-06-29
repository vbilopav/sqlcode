using System;
using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using sqlcode.LocalStorage;
using sqlcode.Scripting;
using Xunit.Abstractions;

namespace IntegrationTests
{
    public class UnitTest1
    {
        [Fact]
        public void Test_QuerySomeData()
        {
            var specs = new ScriptItemSpecs();
            using(var db = new DatabaseAdapter("../../../../sqlcode/local.db", new Mock<ILogger>().Object, null))
            {
                var item1 = db.FirstOrDefault(specs.GetKeySpec(new ScriptKeyModel{Id=1, Type="pgsql"}));
                Console.WriteLine(item1.Content);

                item1.Content = $"new content at {DateTime.Now.ToString()}";

                var result = db.Upsert(item1);
                Console.WriteLine(result);

                item1 = db.FirstOrDefault(specs.GetKeySpec(new ScriptKeyModel{Id=1, Type="pgsql"}));
                Console.WriteLine(item1.Content);

                Console.WriteLine(db.Upsert(new ScriptDocumentModel{
                    Key = new ScriptKeyModel{Id=999, Type="test"},
                    Title = "test",
                    ViewState = "test",
                    Content = "test"
                }));
            }
        }
    }
}
