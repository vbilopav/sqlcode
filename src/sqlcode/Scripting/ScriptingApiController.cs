using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace sqlcode.Scripting
{
    [Route("api/scripting")]
    [ApiController]
    public class ScriptingApiController : ControllerBase
    {
        private readonly IScriptingService _service;

        public ScriptingApiController(IScriptingService service) => _service = service;

        [HttpGet]
        public IActionResult Retreive([FromQuery]ScriptKeyModel key) => Ok(_service.RetreiveByKey(key));

        [HttpPost]
        public async Task<IActionResult> Save([FromQuery]ScriptViewModel model)
        {
            using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
                model.Content = await reader.ReadToEndAsync();
            
            return Ok(_service.AddOrUpdate(model));
        }

        [HttpGet("titles")]
        public IActionResult GetTitlesByType([FromQuery]string type) => Ok(_service.GetTitles(type));

        [HttpPost("title")]
        public IActionResult UpdateTitle(ScriptTitleViewModel model) => Ok(_service.UpdateTitle(model, model.Title));
    }
}