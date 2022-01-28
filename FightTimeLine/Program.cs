using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;

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

        private static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(builder =>
                {
                    builder.AddJsonFile("appsettings.json", true);
                    builder.AddEnvironmentVariables();
                })
                .ConfigureLogging(builder => { builder.AddSerilog(); })
                .UseSerilog((context, configuration) =>
                    configuration
                        .MinimumLevel.Debug()
                        .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                        .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                        .Enrich.FromLogContext()
                        .WriteTo.Console()
                        .When(() => context.HostingEnvironment.IsProduction(), cfg =>
                        {
                            cfg.WriteTo.Console(new RenderedCompactJsonFormatter());
                            cfg.MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command",
                                LogEventLevel.Error);
                        })
                )
                .UseStartup<Startup>();
    }
}
