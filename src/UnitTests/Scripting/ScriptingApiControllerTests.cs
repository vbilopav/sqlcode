﻿using System;
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
            controller.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes("test content"));

            // Act
            var response = await controller.Save(new ScriptViewModel{
                Id = 1, Type = "test type", Title = "title test", ViewState = "view state test"
            });

            // Assert
            Assert.IsType<OkResult>(response);
        }

        [Fact]
        public void Retreive_HappyPath()
        {
            // Arrange
            var serviceMock = new Mock<IScriptingService>();
            serviceMock.Setup(s => s.RetreiveByKey(It.IsAny<ScriptKeyModel>())).Callback<ScriptKeyModel>(p =>
            {
                Assert.True(1 == p.Id);
                Assert.Equal("test type", p.Type);
            }).Returns(new ScriptViewModel
            {
                Id = 1,
                Type = "type",
                Title = "title",
                ViewState = "viewstate",
                Content = "contet"
            });
            var controller = new ScriptingApiController(new Mock<ILogger<ScriptingApiController>>().Object, serviceMock.Object);

            // Act
            var response = controller.Retreive(new ScriptKeyModel{ Id = 1, Type = "test type"});

            Assert.IsType<ScriptViewModel>(((OkObjectResult)response.Result).Value);
            Assert.True(1 == ((ScriptViewModel)((OkObjectResult)response.Result).Value).Id);
            Assert.Equal("type", ((ScriptViewModel)((OkObjectResult)response.Result).Value).Type);
            Assert.Equal("title", ((ScriptViewModel)((OkObjectResult)response.Result).Value).Title);
            Assert.Equal("viewstate", ((ScriptViewModel)((OkObjectResult)response.Result).Value).ViewState);
            Assert.Equal("contet", ((ScriptViewModel)((OkObjectResult)response.Result).Value).Content);
        }
    }
}
