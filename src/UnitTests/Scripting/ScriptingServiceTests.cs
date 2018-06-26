using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using sqlcode;
using sqlcode.LocalStorage;
using sqlcode.Scripting;
using Xunit;

namespace UnitTests.Scripting
{
    public class ScriptingServiceTests
    {
        static ScriptingServiceTests() => Startup.ConfigureAutoMapper();

        [Fact]
        public void AddOrUpdate_HappyPath()
        {
            // Arrange
            var testModel = new ScriptViewModel
            {
                Id = 1,
                Type = "type",
                Title = "title",
                ViewState = "viewstate",
                Content = "contet"
            };
            var dbMock = new Mock<IDatabaseAdapter>();
            dbMock.Setup(s => s.Upsert(It.IsAny<ScriptDocumentModel>())).Callback<ScriptDocumentModel>(p =>
            {
                Assert.True(testModel.Id == p.Key.Id);
                Assert.Equal(testModel.Type, p.Key.Type);
                Assert.Equal(testModel.Title, p.Title);
                Assert.Equal(testModel.ViewState, p.ViewState);
                Assert.Equal(testModel.Content, p.Content);
            });
            var service = new ScriptingService(dbMock.Object);
            
            // Act
            service.AddOrUpdate(testModel);
            
            // Assert in callback
        }
    }
}
