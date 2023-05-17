import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, OnInit, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from "@angular/forms";
import { IGameService } from "src/services/game.service-interface";
import { gameServiceToken } from "src/services/game.service-provider";
import { ISettings, SettingsService } from "src/services/SettingsService";
import { ISettingTab } from "../tabs";

@Component({
  selector: "settingsDialogFflogsTab",
  templateUrl: "./fflogs.component.html",
  styleUrls: ["./fflogs.component.css"],
})
export class SettingsDialogFflogsTab implements OnInit, ISettingTab {
  fflogsForm: UntypedFormGroup;

  private servers: { [region: string]: { [datacenter: string]: string[] } } = {
    JP: {
      Elemental: [
        "Aegis",
        "Atomos",
        "Carbuncle",
        "Garuda",
        "Gungnir",
        "Kujata",
        "Tonbery",
        "Typhon",
      ],
      Gaia: [
        "Alexander",
        "Bahamut",
        "Durandal",
        "Fenrir",
        "Ifrit",
        "Ridill",
        "Tiamat",
        "Ultima",
      ],
      Mana: [
        "Anima",
        "Asura",
        "Chocobo",
        "Hades",
        "Ixion",
        "Masamune",
        "Pandaemonium",
        "Titan",
      ],
      Meteor: [
        "Belias",
        "Mandragora",
        "Ramuh",
        "Shinryu",
        "Unicorn",
        "Valefor",
        "Yojimbo",
        "Zeromus",
      ],
    },
    NA: {
      Aether: [
        "Adamantoise",
        "Cactuar",
        "Faerie",
        "Gilgamesh",
        "Jenova",
        "Midgardsormr",
        "Sargatanas",
        "Siren",
      ],
      Primal: [
        "Behemoth",
        "Excalibur",
        "Exodus",
        "Famfrit",
        "Hyperion",
        "Lamia",
        "Leviathan",
        "Ultros",
      ],
      Crystal: [
        "Balmung",
        "Brynhildr",
        "Coeurl",
        "Diabolos",
        "Goblin",
        "Malboro",
        "Mateus",
        "Zalera",
      ],
      Dynamis: ["Halicarnassus", "Maduin", "Marilith", "Seraph"],
    },
    EU: {
      Chaos: [
        "Cerberus",
        "Louisoix",
        "Moogle",
        "Omega",
        "Phantom",
        "Ragnarok",
        "Sagittarius",
        "Spriggan",
      ],
      Light: [
        "Alpha",
        "Lich",
        "Odin",
        "Phoenix",
        "Raiden",
        "Shiva",
        "Twintania",
        "Zodiark",
      ],
    },
    OC: {
      Materia: ["Bismarck", "Ravana", "Sephirot", "Sophia", "Zurvan"],
    },
  };

  datacenters: {
    [datacenter: string]: { server: string; region: string }[];
  } = {};

  container: any = {
    classes: [
      { name: "Tank", icon: "/assets/images/JobIcons/clear_tank.png" },
      { name: "Heal", icon: "/assets/images/JobIcons/clear_healer.png" },
      { name: "DD", icon: "/assets/images/JobIcons/clear_dps.png" },
    ],
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private settingsService: SettingsService,
    @Inject(gameServiceToken) public gameService: IGameService
  ) {
    Object.keys(this.servers).forEach((r) => {
      Object.keys(this.servers[r]).forEach((d) => {
        this.servers[r][d].forEach((s) => {
          if (!this.datacenters[d]) this.datacenters[d] = [];
          this.datacenters[d].push({ server: s, region: r });
        });
      });
    });
  }

  ngOnInit() {
    const settings = this.settingsService.load();
    const sortOrder = settings.fflogsImport.sortOrderAfterImport;

    this.container.classes = this.container.classes.sort(
      (a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name)
    );

    this.fflogsForm = this.formBuilder.group(
      {
        bossAttacksSource: new UntypedFormControl(
          settings.fflogsImport.bossAttacksSource
        ),
        characterName: new UntypedFormControl(
          settings.fflogsImport.characterName || ""
        ),
        characterServer: new UntypedFormControl(
          settings.fflogsImport.characterRegion &&
          settings.fflogsImport.characterServer
            ? settings.fflogsImport.characterServer +
              "|" +
              settings.fflogsImport.characterRegion
            : ""
        ),
        translate: new UntypedFormControl(settings.fflogsImport.translate),
      },
      {}
    );
  }

  get ff() {
    return this.fflogsForm.controls;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.container.classes,
      event.previousIndex,
      event.currentIndex
    );
  }

  updateResult(settings: ISettings): void {
    settings.fflogsImport.bossAttacksSource = this.ff.bossAttacksSource.value;
    settings.fflogsImport.sortOrderAfterImport = this.container.classes.map(
      (it) => it.name
    );
    settings.fflogsImport.characterName = this.ff.characterName.value;
    settings.fflogsImport.translate = this.ff.translate.value;

    if (this.ff.characterServer.value) {
      const parts = this.ff.characterServer.value.split("|");
      settings.fflogsImport.characterServer = parts[0];
      settings.fflogsImport.characterRegion = parts[1];
    } else {
      settings.fflogsImport.characterServer = "";
      settings.fflogsImport.characterRegion = "";
    }
  }
}
