// See https://aka.ms/new-console-template for more information

using System.Text;
using System.Text.Json;
using ActionsParser;

Console.OutputEncoding = Encoding.UTF8;

var client = new HttpClient();
client.BaseAddress = new Uri("https://xivapi.com");

var httpClient = new CachedHttpClient(client, "d:\\temp\\jobcache");

var xivApi = new XivApi(httpClient);

var classes = new Dictionary<int, ClassJob>();

var jobs = await xivApi.GetJobs();


foreach (Job job in jobs)
{
   var jobResult = await xivApi.GetJob(job);
   if (jobResult != null)
   {
      classes.Add(jobResult.ID, jobResult);
   }
}

string actionsDir = "d:\\temp\\ffxiv-actions";

if (!Directory.Exists(actionsDir))
   Directory.CreateDirectory(actionsDir);

foreach (var cls in classes.Values)
{
   if (cls.StartingLevel > 15 || cls.ClassJobParent != null)
   {
      var filename = Path.ChangeExtension(Path.Combine(actionsDir, cls.Name), "json");

      var dict = new Dictionary<string, object>();

      Console.WriteLine(cls.Name);
      
      dict.Add("JOB", new
      {
         de = cls.Name_de,
         jp = cls.Name_ja,
         en = cls.Name_en,
         fr = cls.Name_fr
      });
      
      dict.Add("JOB_AB", new
      {
         de = cls.Abbreviation_de,
         jp = cls.Abbreviation_ja,
         en = cls.Abbreviation_en,
         fr = cls.Abbreviation_fr
      });
      
      var actions = cls.GameContentLinks.Action.ClassJob;
      var parentId = cls.ClassJobParent?.ID;
      if (parentId.HasValue)
         actions.AddRange(classes[parentId.Value].GameContentLinks.Action.ClassJob);

      foreach (var action in actions)
      {
         var act = await xivApi.GetAction(action);
         if (act != null)
         {
            if (!dict.ContainsKey(act.Name))
               dict.Add(act.Name, new
               {
                  de = act.Name_de,
                  jp = act.Name_ja,
                  en = act.Name_en,
                  fr = act.Name_fr
               });
         }
      }

      await using var file = File.CreateText(filename);
      await JsonSerializer.SerializeAsync(file.BaseStream, dict, new JsonSerializerOptions()
      {
         WriteIndented = true
      });
   }
}