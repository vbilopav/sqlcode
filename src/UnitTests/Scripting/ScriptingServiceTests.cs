using System;
using System.IO;
using System.Linq.Expressions;
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

        [Fact]
        public void RetreiveByKey_Found_HappyPath()
        {
            // Arrange
            var testModel = new ScriptDocumentModel
            {
                Key = new ScriptKeyModel{Id = 1, Type="type"},
                Title = "title",
                ViewState = "viewstate",
                Content = "content"
            };

            var dbMock = new Mock<IDatabaseAdapter>();
            dbMock.Setup(s => s.FirstOrDefault<ScriptDocumentModel>(
                It.IsAny<Expression<Func<ScriptDocumentModel, bool>>>())
            ).Returns(testModel);

            var service = new ScriptingService(dbMock.Object);

            // Act
            var result = service.RetreiveByKey(new ScriptKeyModel());

            // Assert
            Assert.IsType<ScriptViewModel>(result);
            Assert.True(testModel.Key.Id == result.Id);
            Assert.Equal(testModel.Key.Type, result.Type);
            Assert.Equal(testModel.Title, result.Title);
            Assert.Equal(testModel.ViewState, result.ViewState);
            Assert.Equal(testModel.Content, result.Content);
        }

        [Fact]
        public void RetreiveByKey_NotFound_HappyPath()
        {
            var dbMock = new Mock<IDatabaseAdapter>();
            dbMock.Setup(s => s.FirstOrDefault<ScriptDocumentModel>(
                It.IsAny<Expression<Func<ScriptDocumentModel, bool>>>())
            ).Returns(default(ScriptDocumentModel));

            var service = new ScriptingService(dbMock.Object);

            // Act
            var result = service.RetreiveByKey(new ScriptKeyModel());

            // Assert
            Assert.Null(result);
        }
    }
}
