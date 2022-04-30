// // <copyright file="CachedHttpClient.cs" company="ZoralLabs">
// //   Copyright (c) 2018-2022 Zoral Limited. All Rights Reserved.
// //   This software licensed under exclusive legal right of the copyright holder
// //   with the intent that the licensee is given the right to use the software
// //   only under certain conditions, and restricted from other uses, such as
// //   sharing, redistribution, or reverse engineering.
// // </copyright>

using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ActionsParser;

public class CachedHttpClient
{
   private HttpClient _httpClient;
   private string _directory;

   public CachedHttpClient(HttpClient httpClient, string directory)
   {
      _httpClient = httpClient;
      _directory = directory;
   }

   public async Task<T?> GetAsync<T>(string uri)
   {
      var jsonSerializerOptions = new JsonSerializerOptions()
      {
         NumberHandling = JsonNumberHandling.AllowReadingFromString
      };
      
      if (!Directory.Exists(_directory))
         Directory.CreateDirectory(_directory);

      var escapedPath = Path.GetInvalidFileNameChars().Aggregate(uri,(c, c1) => c.Replace(c1.ToString(),""));
      escapedPath = Path.ChangeExtension(escapedPath, "json");

      var filePath = Path.Combine(_directory, escapedPath);

      if (File.Exists(filePath))
      {
         await using FileStream fileStream = File.Open(filePath, FileMode.Open);
         return JsonSerializer.Deserialize<T>(fileStream, jsonSerializerOptions);
      }

      using var response = await _httpClient.GetAsync(uri);
      var data = await response.Content.ReadAsStringAsync();
      await using StreamWriter streamWriter = File.CreateText(filePath);
      await streamWriter.WriteAsync(data);
      
      
      return JsonSerializer.Deserialize<T>(data, jsonSerializerOptions);
   }
}