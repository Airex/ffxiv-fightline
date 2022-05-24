// // <copyright file="XivApi.cs" company="ZoralLabs">
// //   Copyright (c) 2018-2022 Zoral Limited. All Rights Reserved.
// //   This software licensed under exclusive legal right of the copyright holder
// //   with the intent that the licensee is given the right to use the software
// //   only under certain conditions, and restricted from other uses, such as
// //   sharing, redistribution, or reverse engineering.
// // </copyright>

using System.Net.Http.Json;

namespace ActionsParser;

public class Pagination
{
   public int Page { get; set; }
   public object PageNext { get; set; }
   public object PagePrev { get; set; }
   public int PageTotal { get; set; }
   public int Results { get; set; }
   public int ResultsPerPage { get; set; }
   public int ResultsTotal { get; set; }
}

public class Job
{
   public int ID { get; set; }
   public string Icon { get; set; }
   public string Name { get; set; }
   public string Url { get; set; }
}

public class Root<T>
{
   public Pagination Pagination { get; set; }
   public List<T> Results { get; set; }
}




public class XivApi
{
   private readonly CachedHttpClient _client;

   public XivApi(CachedHttpClient client)
   {
      _client = client;
   }

   public async Task<IEnumerable<Job>> GetJobs()
   {
      var result = await _client.GetAsync<Root<Job>>("/classjob");
      return result!.Results;
   }

   public async Task<ClassJob?> GetJob(Job job)
   {
      return await _client.GetAsync<ClassJob>(job.Url);
   }

   public async Task<JobAction?> GetAction(int action)
   {
      return await _client.GetAsync<JobAction>("/action/"+action);
   }
}