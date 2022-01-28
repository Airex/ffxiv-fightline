// // <copyright file="FightHub.cs" company="ZoralLabs">
// //   Copyright (c) 2018-2019 Zoral Limited. All Rights Reserved.
// //   This software licensed under exclusive legal right of the copyright holder
// //   with the intent that the licensee is given the right to use the software
// //   only under certain conditions, and restricted from other uses, such as
// //   sharing, redistribution, or reverse engineering.
// // </copyright>

using System;
using System.Linq;
using System.Threading.Tasks;
using FightTimeLine.Contracts;
using FightTimeLine.DataLayer;
using Microsoft.AspNetCore.SignalR;

namespace FightTimeLine.Hubs
{
     public class FightHub : Hub
     {
          private readonly FightTimelineDataContext _dataContext;
          private readonly IHubUsersStorage _usersStorage;

          public FightHub(FightTimelineDataContext dataContext, IHubUsersStorage usersStorage)
          {
               _dataContext = dataContext ?? throw new ArgumentNullException(nameof(dataContext));
               _usersStorage = usersStorage ?? throw new ArgumentNullException(nameof(usersStorage));
          }

          public async Task StartSession(string fight, string userName)
          {
               if (!Guid.TryParseExact(fight, "N", out var fightGuid) && !Guid.TryParse(fight, out fightGuid))
                    return;

               await _usersStorage.AddUserAsync(new UserContainer()
               {
                    Fight = fightGuid,
                    Name = userName,
                    Id = Context.ConnectionId
               });
               
               Context.Items.Add("fight", fightGuid);
               Context.Items.Add("username", userName);
               await Groups.AddToGroupAsync(Context.ConnectionId, fight);
          }

          public async Task Command(string fight, string userName, string commandId)
          {
               if (!Guid.TryParseExact(fight, "N", out var fightGuid) && !Guid.TryParse(fight, out fightGuid))
                    return;

               await _usersStorage.TouchAsync(fightGuid, Context.ConnectionId);

               await Clients.OthersInGroup(fight).SendAsync("command", new CommandData()
               {
                    Id = commandId,
                    UserId = Context.ConnectionId
               });
          }

          public async Task Connect(string fight, string userName)
          {
               if (!Guid.TryParseExact(fight, "N", out var fightGuid) && !Guid.TryParse(fight, out fightGuid))
                    return;

               await _usersStorage.AddUserAsync(new UserContainer()
               {
                    Fight = fightGuid,
                    Id = Context.ConnectionId,
                    Name = userName
               });

               Context.Items.Add("fight", fightGuid);
               Context.Items.Add("username", userName);
               await Groups.AddToGroupAsync(Context.ConnectionId, fight);
               await Clients.OthersInGroup(fight).SendAsync("connected", new User() { id = Context.ConnectionId, name = userName });
               await SendActiveUsers(fight);
          }

          public async Task Disconnect(string fight)
          {
               await Task.Yield();
          }

          private async Task SendActiveUsers(string fight)
          {
               if (!Guid.TryParseExact(fight, "N", out var fightGuid) && !Guid.TryParse(fight, out fightGuid))
                    return;

               var array = (await _usersStorage.GetUsersForFightAsync(fightGuid)).Where(container => container.Id != Context.ConnectionId).Select(container => new User()
               {
                    id = container.Id,
                    name = container.Name
               }).ToArray();
               await Clients.Caller.SendAsync("activeUsers", array);
          }



          public override async Task OnDisconnectedAsync(Exception exception)
          {
               var fight = (Guid)Context.Items["fight"];

               await _usersStorage.RemoveUserAsync(fight, Context.ConnectionId).ConfigureAwait(false);
               await Clients.OthersInGroup(fight.ToString("N")).SendAsync("disconnected", new User() { id = Context.ConnectionId, name = Context.Items["username"]?.ToString() }).ConfigureAwait(false);
               await Groups.RemoveFromGroupAsync(Context.ConnectionId, fight.ToString("N"));
               await base.OnDisconnectedAsync(exception);
          }
     }

     public class CommandData
     {
          public string Id { get; set; }
          public string UserId { get; set; }
     }
}