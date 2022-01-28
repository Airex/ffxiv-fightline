using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FightTimeLine.DataLayer
{
     [Table("Bosses")]
     public class BossEntity
     {
          [Key]
          public int Id { get; set; }
          public Guid Identifier { get; set; }
          public string Name { get; set; }
          public string UserName { get; set; }
          public bool IsPrivate { get; set; }
          public string Data { get; set; }
          public long? Reference { get; set; }
          [DefaultValue("ffxiv")]
          public string Game { get; set; }
          public DateTimeOffset? CreateDate { get; set; }
          public DateTimeOffset? ModifiedDate { get; set; }
     }

     [Table("Fights")]
     public class FightEntity
     {
          [Key]
          public int Id { get; set; }
          public Guid Identifier { get; set; }
          public string Name { get; set; }
          public string UserName { get; set; }
          public string Data { get; set; }
          [DefaultValue("ffxiv")]
          public string Game { get; set; }
          [DefaultValue(true)]
          public bool? IsDraft { get; set; }
          public DateTimeOffset? CreateDate { get; set; }
          public DateTimeOffset? ModifiedDate { get; set; }
     }

     [Table("Users")]
     public class UserEntity
     {
          [Key]
          public int Id { get; set; }
          public string Name { get; set; }
          public string Password { get; set; }
          [DefaultValue(false)]
          public bool IsAdmin { get; set; }
     }

     [Table("Commands")]
     public class CommandEntity
     {
          [Key]
          public int Id { get; set; }
          public Guid Fight { get; set; }
          public string UserName { get; set; }
          public DateTimeOffset DateCreated { get; set; }
          public string Body { get; set; }
     }

     [Table("Sessions")]
     public class SessionEntity
     {
          [Key]
          public int Id { get; set; }
          public Guid Fight { get; set; }
          public string UserName { get; set; }
          public string UserId { get; set; }
          public DateTimeOffset? LastTouched { get; set; }
     }

     public interface IFightTimelineDbContext
     {
          DbSet<BossEntity> Bosses { get; set; }
          DbSet<FightEntity> Fights { get; set; }
          DbSet<UserEntity> Users { get; set; }
          DbSet<CommandEntity> Commands { get; set; }
          DbSet<SessionEntity> Sessions { get; set; }
     }


     public class FightTimelineDataContext : DbContext, IFightTimelineDbContext
     {
          public DbSet<BossEntity> Bosses { get; set; }
          public DbSet<FightEntity> Fights { get; set; }
          public DbSet<UserEntity> Users { get; set; }
          public DbSet<CommandEntity> Commands { get; set; }
          public DbSet<SessionEntity> Sessions { get; set; }

          public FightTimelineDataContext(DbContextOptions options) : base(options)
          {
          }
     }
}