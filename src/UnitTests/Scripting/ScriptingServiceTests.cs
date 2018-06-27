using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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
            dbMock
                .Setup(s => s.FirstOrDefault<ScriptDocumentModel>(It.IsAny<Expression<Func<ScriptDocumentModel, bool>>>()))
                .Returns(testModel);

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
            // Arrange
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

        [Fact]
        public void GetTitles_HappyPath()
        {
            // Arrange
            bool FindAll_called = false;
            var dbMock = new Mock<IDatabaseAdapter>();
            dbMock
                .Setup(s => s.FindBy<ScriptDocumentModel>(It.IsAny<Expression<Func<ScriptDocumentModel, bool>>>()))
                .Callback<Expression<Func<ScriptDocumentModel, bool>>>(p => 
                {
                    FindAll_called = true;
                })
                .Returns(
                    new List<ScriptDocumentModel>{
                        new ScriptDocumentModel{Key=new ScriptKeyModel{Id=1, Type="type1"}, Title="title1"},
                        new ScriptDocumentModel{Key=new ScriptKeyModel{Id=2, Type="type1"}, Title="title2"},
                    });
            var service = new ScriptingService(dbMock.Object);

            // Act
            var result = service.GetTitles("type1").ToList();

            // Assert
            Assert.True(FindAll_called);
            Assert.Equal(2, result.Count);
            Assert.True(result.Contains("title1"));
            Assert.True(result.Contains("title2"));
        }
    }
}
