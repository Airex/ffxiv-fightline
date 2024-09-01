using System;
using System.Text;
using FightTimeLine.Contracts;
using FightTimeLine.DataLayer;
using FightTimeLine.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

namespace FightTimeLine
{
     public class Startup
     {
          public Startup(IConfiguration configuration)
          {
               Configuration = configuration;
          }

          public IConfiguration Configuration { get; }

          // This method gets called by the runtime. Use this method to add services to the container.
          public void ConfigureServices(IServiceCollection services)
          {
               services.AddOptions();
               services.AddRazorPages();
               services.AddMemoryCache();
               services.AddHttpClient();
               services.AddControllers().AddNewtonsoftJson();
               services.AddHealthChecks();
               services.AddSingleton(Configuration);

               services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                   .AddJwtBearer(options =>
                   {
                        options.TokenValidationParameters = new TokenValidationParameters()
                        {
                             ValidateIssuer = false,
                             ValidateAudience = false,
                             ValidateLifetime = false,
                             ValidateIssuerSigningKey = true,
                             IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]!))
                        };
                   });

               services.AddScoped<IHubUsersStorage, SqlServerHubUsersStorage>();

               services.AddCors(options =>
                    {
                         options.AddDefaultPolicy(cb => cb
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowAnyOrigin());
                         options.AddPolicy("CorsPolicy", cb => cb
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowAnyOrigin()
                         );
                    }
               );

               services.AddSignalR().AddJsonProtocol();
               var serverVersion = new MySqlServerVersion(new Version(5, 7, 0));
               services.AddDbContextPool<FightTimelineDataContext>(builder =>
               {
                    builder.ConfigureWarnings(warnings => warnings
                         .Ignore(CoreEventId.ContextInitialized)
                         .Ignore(CoreEventId.ContextDisposed));
                    builder.UseMySql(Configuration.GetConnectionString("Default"), serverVersion);
               });

               // In production, the Angular files will be served from this directory
               services.AddSpaStaticFiles(configuration =>
               {
                    configuration.RootPath = "ClientApp/dist/browser";
               });
          }

          // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
          public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
          {
               app.SeedData();

               if (env.IsDevelopment())
               {
                    app.UseDeveloperExceptionPage();
               }
               else
               {
                    app.UseExceptionHandler("/Error");
                    app.UseHsts();
                    app.UseHttpsRedirection();
               }
               app.UseStaticFiles(new StaticFileOptions()
               {
                    HttpsCompression = HttpsCompressionMode.Compress,
                    OnPrepareResponse = context =>
                    {
                         var headers = context.Context.Response.GetTypedHeaders();
                         headers.CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
                         {
                              Public = true,
                              MaxAge = TimeSpan.FromDays(30)
                         };
                    }
               });
               app.UseSpaStaticFiles(new StaticFileOptions()
               {
                    HttpsCompression = HttpsCompressionMode.Compress,
                    OnPrepareResponse = context =>
                    {
                         var headers = context.Context.Response.GetTypedHeaders();
                         headers.CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
                         {
                              Public = true,
                              MaxAge = TimeSpan.FromDays(30)
                         };
                    }
               });

               app.UseCors();

               app.UseRouting();

               app.UseAuthentication();
               app.UseAuthorization();
               

               app.UseEndpoints(builder =>
               {
                    builder.MapControllers();
                    builder.MapHealthChecks("/health");
                    builder.MapControllerRoute("fightsApi", "api/{controller=Fights}/{action=Search}");
                    builder.MapHub<FightHub>("/fighthub",
                         options =>
                         {
                              options.ApplicationMaxBufferSize = 4 * 1024 * 1024;
                              options.TransportMaxBufferSize = 4 * 1024 * 1024;
                         });
               });

               app.UseSpa(spa =>
               {
                    // To learn more about options for serving an Angular SPA from ASP.NET Core,
                    // see https://go.microsoft.com/fwlink/?linkid=864501
               
                    spa.Options.SourcePath = "ClientApp";

                    if (env.IsDevelopment())
                    {
                         spa.UseAngularCliServer(npmScript: "start");
                    }
               });
          }
     }

     public static class DataSeeder
     {
          public static void SeedData(this IApplicationBuilder app)
          {
               using var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope();
               using var context = scope.ServiceProvider.GetRequiredService<FightTimelineDataContext>();
               if (!context.Database.EnsureCreated())
                    context.Database.Migrate();
          }
     }
}
