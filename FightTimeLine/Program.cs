using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace FightTimeLine
{
    public class Program
    {
        public static void Main(string[] args)
        {
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                // .UseSentry(options =>
                // {
                //     options.BeforeSend = ev =>
                //     {
                //         ev.ServerName = null;
                //         return ev;
                //     };
                // })
        ;
    }
}
