using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using sqlcode.Scripting;
using Xunit;

namespace UnitTests.Scripting
{
    public class ScriptingApiControllerTests
    {
        [Fact]
        public async Task Save_HappyPath()
        {
            // Arrange
            var serviceMock = new Mock<IScriptingService>();
            serviceMock.Setup(s => s.AddOrUpdate(It.IsAny<ScriptViewModel>())).Callback<ScriptViewModel>(p =>
            {
                Assert.True(1 == p.Id);
                Assert.Equal("test type", p.Type);
                Assert.Equal("title test", p.Title);
                Assert.Equal("view state test", p.ViewState);
                Assert.Equal("test content", p.Content);
            });
            var controller = new ScriptingApiController(new Mock<ILogger<ScriptingApiController>>().Object, serviceMock.Object)
            {
                ControllerContext = {HttpContext = new DefaultHttpContext()}
            };
            controller.Request.QueryString = new QueryString(
                @"?{""Id"": 1, ""Type"": ""test type"", ""Title"": ""title test"", ""ViewState"":  ""view state test""}"
            );
            controller.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes("test content"));


            // Act
            var result = await controller.Save();

            // Assert
            Assert.IsType<OkResult>(result);
        }
    }
}
