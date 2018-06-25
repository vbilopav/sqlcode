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

        [HttpPost]
        public async Task<IActionResult> Save()
        {
            if (string.IsNullOrEmpty(Request.QueryString.Value))
            {
                _log.LogError("Save model missing in query sttring");
                return BadRequest();
            }
            var query = HttpUtility.UrlDecode(Request.QueryString.Value.Remove(0, 1));
            if (string.IsNullOrEmpty(query))
            {
                _log.LogError("Save model missing in query sttring");
                return BadRequest();
            }

            ScriptViewModel model;
            try
            {
                model = JsonConvert.DeserializeObject<ScriptViewModel>(query);
            }
            catch (JsonReaderException)
            {
                _log.LogError("Save model malformed");
                return BadRequest();
            }

            using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
                model.Content = await reader.ReadToEndAsync();

            _service.AddOrUpdate(model);
            return Ok();
        }
    }
}