using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using FightTimeLine.DataLayer;
using FightTimeLine.DataModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace FightTimeLine.Controllers
{
    [Route("api/[controller]")]
    public class TokenController : Controller
    {
        private readonly FightTimelineDataContext _dataContext;
        private readonly IConfiguration _configuration;
        private ILogger<TokenController> _logger;

        public TokenController(FightTimelineDataContext dataContext, IConfiguration configuration, ILogger<TokenController> logger)
        {
            _dataContext = dataContext;
            _configuration = configuration;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("[action]")]
        public async Task<IActionResult> CreateToken([FromBody] LoginModel login)
        {
            _logger.LogInformation("Creating token for user {User}", login.Username);
            IActionResult response = Unauthorized();
            var user = await Authenticate(login).ConfigureAwait(false);

            if (user != null)
            {
                _logger.LogInformation("User {User} authenticated", login.Username);
                var tokenString = BuildToken(user);
                response = Ok(new { token = tokenString });
            }
            else
            {
                _logger.LogInformation("User {User} unauthenticated", login.Username);    
            }
            return response;
        }

        private Task<UserEntity> Authenticate(LoginModel login)
        {
            _logger.LogInformation("Authenticating user {User}", login.Username);
            var found = _dataContext.Users.FirstOrDefaultAsync(entity => entity.Name == login.Username && entity.Password == login.Password);
            _logger.LogInformation("User {User} found: {Found}", login.Username, found!=null);
            return found;
        }

        private string BuildToken(UserEntity user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>()
            {
                new(JwtRegisteredClaimNames.Sub, user.Name),
            };

            var token = new JwtSecurityToken(_configuration["Jwt:Issuer"],
                "ffxivclient",
                expires: null,
                signingCredentials: creds,
                claims: claims);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }


   
}
