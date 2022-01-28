// // <copyright file="Extensions.cs" company="ZoralLabs">
// //   Copyright (c) 2018-2021 Zoral Limited. All Rights Reserved.
// //   This software licensed under exclusive legal right of the copyright holder
// //   with the intent that the licensee is given the right to use the software
// //   only under certain conditions, and restricted from other uses, such as
// //   sharing, redistribution, or reverse engineering.
// // </copyright>

using System;
using Serilog;

namespace FightTimeLine
{
   public static class Extensions
   {
      internal static LoggerConfiguration When(this LoggerConfiguration configuration, Func<bool> predicate,
         Action<LoggerConfiguration> action)
      {
         if (predicate())
         {
            action(configuration);
         }

         return configuration;
      }
   }
}