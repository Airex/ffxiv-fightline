// // <copyright file="Models.cs" company="ZoralLabs">
// //   Copyright (c) 2018-2019 Zoral Limited. All Rights Reserved.
// //   This software licensed under exclusive legal right of the copyright holder
// //   with the intent that the licensee is given the right to use the software
// //   only under certain conditions, and restricted from other uses, such as
// //   sharing, redistribution, or reverse engineering.
// // </copyright>

using System;
using Newtonsoft.Json;

namespace FightTimeLine.DataModels
{
     public class AddCommandData
     {
          [JsonProperty("data")]
          public string Data { get; set; }
          [JsonProperty("fight")]
          public string Fight { get; set; }
     }

     public class CommandData
     {
          [JsonProperty("userName")]
          public string UserName { get; set; }
          [JsonProperty("fight")]
          public string Fight { get; set; }
          [JsonProperty("data")]
          public string Data { get; set; }
          [JsonProperty("timestamp")]
          public DateTimeOffset Timestamp { get; set; }
     }

     public class BossData
     {
          [JsonProperty("id")]
          public string Id { get; set; }
          [JsonProperty("name")]
          public string Name { get; set; }
          [JsonProperty("userName")]
          public string UserName { get; set; }
          [JsonProperty("data")]
          public string Data { get; set; }
          [JsonProperty("isPrivate")]
          public bool IsPrivate { get; set; }
          [JsonProperty("ref")]
          public long Reference { get; set; }
          [JsonProperty("createDate")]
          public DateTimeOffset CreateDate { get; set; }
          [JsonProperty("modifiedDate")]
          public DateTimeOffset ModifiedDate { get; set; }
          [JsonProperty("game")]
          public string Game { get; set; }
     }

     public class FightData
     {
          [JsonProperty("id")]
          public string Id { get; set; }
          [JsonProperty("name")]
          public string Name { get; set; }
          [JsonProperty("userName")]
          public string UserName { get; set; }
          [JsonProperty("data")]
          public string Data { get; set; }
          [JsonProperty("isDraft")]
          public bool IsDraft { get; set; }
          [JsonProperty("dateModified")]
          public DateTimeOffset DateModified { get; set; }
          [JsonProperty("game")]
          public string Game { get; set; }
     }

     public class BossSearchResult
     {
          public string Id { get; set; }
          public string Name { get; set; }
          public string Owner { get; set; }
          public bool CanRemove { get; set; }
          [JsonProperty("createDate")]
          public DateTimeOffset CreateDate { get; set; }
          [JsonProperty("modifiedDate")]
          public DateTimeOffset ModifiedDate { get; set; }
     }

     public class FightSearchResult
     {
          public string Id { get; set; }
          public string Name { get; set; }
          public bool IsDraft { get; set; }
          public DateTimeOffset? DateModified { get; set; }
          public DateTimeOffset? DateCreated { get; set; }
     }

     public class LoginModel
     {
          public string Username { get; set; }
          public string Password { get; set; }
     }

     public class RegisterUserModel
     {
          public string Username { get; set; }
          public string Password { get; set; }
     }
}