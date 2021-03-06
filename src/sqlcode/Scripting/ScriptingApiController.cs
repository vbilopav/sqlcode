﻿using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace sqlcode.Scripting
{
    [Route("api/scripting")]
    [ApiController]
    public class ScriptingApiController : ControllerBase
    {
        private readonly IScriptingService service;

        public ScriptingApiController(IScriptingService service) => this.service = service;

        [HttpGet]
        public IActionResult Retreive([FromQuery]ScriptKeyModel key) => Ok(service.RetreiveByKey(key));

        [HttpPost]
        public async Task<IActionResult> Save([FromQuery]ScriptViewModel model)
        {
            using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
                model.Content = await reader.ReadToEndAsync();
            
            return Ok(new {
                IsNew = service.AddOrUpdate(model),
                Saved = true
            });
        }

        [HttpGet("titles")]
        public IActionResult GetAllTitles([FromQuery]string type) => Ok(service.GetAllTitles(type));

        [HttpPost("title")]
        public IActionResult UpdateTitle([FromQuery]ScriptTitleViewModel model)
        {
            try
            {
               return Ok(service.UpdateTitle(model, model.Title));
            }
            catch(ScriptingServiceException)
            {
                return BadRequest();
            }
        }

        [HttpGet("items")]
        public IActionResult GetAllItems([FromQuery]string type) => Ok(service.GetAllItems(type));

        [HttpPost("viewstate")]
        public async Task<IActionResult> UpdateViewState([FromQuery]ScriptKeyModel key)
        {
            string viewstate;
            using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
                viewstate = await reader.ReadToEndAsync();
            return Ok(service.UpdateViewState(key, viewstate));
        }
    }
}