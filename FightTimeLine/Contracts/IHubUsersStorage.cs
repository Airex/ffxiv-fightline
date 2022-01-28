// // <copyright file="IHubUsersStorage.cs" company="ZoralLabs">
// //   Copyright (c) 2018-2019 Zoral Limited. All Rights Reserved.
// //   This software licensed under exclusive legal right of the copyright holder
// //   with the intent that the licensee is given the right to use the software
// //   only under certain conditions, and restricted from other uses, such as
// //   sharing, redistribution, or reverse engineering.
// // </copyright>

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FightTimeLine.Hubs;

namespace FightTimeLine.Contracts
{
     public interface IHubUsersStorage
     {
          Task AddUserAsync(UserContainer user);
          Task RemoveUserAsync(Guid fight, string userId);
          Task<IEnumerable<UserContainer>> GetUsersForFightAsync(Guid fight);
          Task TouchAsync(Guid fight, string usedId);
     }
}