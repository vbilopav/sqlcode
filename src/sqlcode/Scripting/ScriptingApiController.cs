using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace sqlcode.Scripting
{
    [Route("api/scripting")]
    [ApiController]
    public class ScriptingApiController : ControllerBase
    {
        private readonly ILogger<ScriptingApiController> _log;
        private readonly IScriptingService _service;

        public ScriptingApiController(ILogger<ScriptingApiController> log, IScriptingService service)
        {
            _log = log;
            _service = service;
        }

        [HttpGet]
        public ActionResult<ScriptViewModel> Retreive([FromQuery]ScriptKeyModel key)
        {
            var result = _service.RetreiveByKey(key);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromQuery]ScriptViewModel model)
        {
            using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
                model.Content = await reader.ReadToEndAsync();

            _service.AddOrUpdate(model);
            return Ok();
        }
    }
}