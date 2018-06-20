using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace sqlcode.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScriptsController : ControllerBase
    {
        // POST: api/Scripts
        [HttpPost]
        public ActionResult Post(int id, string type, string viewState, [FromBody]string value)
        {
            return Ok();
        }
    }
}
