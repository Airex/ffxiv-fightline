using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace FightTimeLine.Filters
{
   public class CaptchaValidateAttribute : ActionFilterAttribute
   {
      public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
      {
         if (context.HttpContext.Request.Headers.ContainsKey("Captcha"))
         {
            var configuration = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var configurationSection = configuration.GetSection("Captcha");
            HttpClient client = context.HttpContext.RequestServices.GetRequiredService<IHttpClientFactory>().CreateClient();

            var captcha = context.HttpContext.Request.Headers["Captcha"];
            var uri = $"{configurationSection["Url"]}?secret={configurationSection["Secret"]}&response={captcha}";
            var httpResponseMessage = await client.PostAsync(uri, new StringContent("", Encoding.UTF8, "application/json"));
            await using var stream = await httpResponseMessage.Content.ReadAsStreamAsync();
            using var httpRequestStreamReader = new HttpRequestStreamReader(stream, Encoding.UTF8);
            using var jsonTextReader = new JsonTextReader(httpRequestStreamReader);
            var deserializeObject = await JObject.LoadAsync(jsonTextReader);
            if (deserializeObject["success"].Value<bool>())
            {
               await next();
               return;
            }
         }

         context.Result = new BadRequestResult();
      }
   }
}