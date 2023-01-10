using System;
using System.Threading.Tasks;
using FightTimeLine.DataLayer;
using FightTimeLine.DataModels;
using FightTimeLine.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FightTimeLine.Controllers
{
   [Route("api/[controller]")]
   public class UsersController : Controller
   {
      private readonly FightTimelineDataContext _dataContext;
      ILogger<UsersController> _logger;

      public UsersController(FightTimelineDataContext dataContext,
         ILogger<UsersController> logger)
      {
         _dataContext = dataContext;
         _logger = logger;
      }

      [HttpGet]
      [AllowAnonymous]
      [Route("[action]")]
      public async Task<IActionResult> Exists([FromQuery] string username)
      {
         var userEntity = await _dataContext.Users.AsNoTracking().FirstOrDefaultAsync(entity => entity.Name == username);
         return Json(userEntity != null || string.Equals(username, "anonymous", StringComparison.OrdinalIgnoreCase));
      }

      [AllowAnonymous]
      [HttpPost]
      [Route("[action]")]
      [CaptchaValidate]
      public async Task<IActionResult> CreateUser([FromBody] RegisterUserModel model)
      {
         _logger.LogInformation("Creating user for {User}", model.Username);
         if (await _dataContext.Users.AsNoTracking().AnyAsync(entity => entity.Name == model.Username))
         {
            _logger.LogInformation("Duplicate user found for user {User}", model.Username);
            return BadRequest();
         }

         var userEntity = new UserEntity
         {
            Name = model.Username,
            Password = model.Password
         };
         await _dataContext.Users.AddAsync(userEntity);
         var inserted = await _dataContext.SaveChangesAsync();
         
         _logger.LogInformation("User {User} created with status: {Status}", model.Username, inserted > 0);

         return new JsonResult(new { created = inserted > 0 });
      }
   }
}