import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms"
import { IGameService } from "src/services/game.service-interface";
import { gameServiceToken } from "src/services/game.service-provider";
import { ISettings, SettingsService } from "src/services/SettingsService";
import { ISettingTab } from "../tabs";


@Component({
  selector: "settingsDialogFflogsTab",
  templateUrl: "./fflogs.component.html",
  styleUrls: ["./fflogs.component.css"]
})

export class SettingsDialogFflogsTab implements OnInit, ISettingTab {


  fflogsForm: FormGroup;

  private servers: { [region: string]: { [datacenter: string]: string[] } } = {
    JP: {
      Elemental: ["Aegis", "Atomos", "Carbuncle", "Garuda", "Gungnir", "Kujata", "Ramuh", "Tonbery", "Typhon", "Tonbery", "Unicorn"],
      Gaia: ["Alexander", "Bahamut", "Durandal", "Fenrir", "Ifrit", "Ridill", "Tiamat", "Ultima", "Valefor", "Yojimbo", "Zeromus"],
      Mana: ["Anima", "Asura", "Belias", "Chocobo", "Hades", "Ixion", "Mandragora", "Masamune", "Pandaemonium", "Shinryu", "Titan"]
    },
    NA: {
      Aether: ["Adamantoise", "Cactuar", "Faerie", "Gilgamesh", "Jenova", "Midgardsormr", "Sargatanas", "Siren"],
      Primal: ["Behemoth", "Excalibur", "Exodus", "Famfrit", "Hyperion", "Lamia", "Leviathan", "Ultros"],
      Crystal: ["Balmung", "Brynhildr", "Coeurl", "Diabolos", "Goblin", "Malboro", "Mateus", "Zalera"]
    },
    EU: {
      Chaos: ["Cerberus", "Louisoix", "Moogle", "Omega", "Ragnarok", "Sprigan"],
      Light: ["Lich", "Odin", "Phoenix", "Shiva", "Twintania", "Zodiark"]
    }
  }

  datacenters: {
    [datacenter: string]: { server: string, region: string }[]
  } = {};

  container: any = {
    classes: [
      { name: "Tank", icon: "/assets/images/JobIcons/clear_tank.png" },
      { name: "Heal", icon: "/assets/images/JobIcons/clear_healer.png" },
      { name: "DD", icon: "/assets/images/JobIcons/clear_dps.png" },
    ]
  }

  constructor(    
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,    
    @Inject(gameServiceToken) public gameService: IGameService) {

    Object.keys(this.servers).forEach(r => {
      Object.keys(this.servers[r]).forEach(d => {
        this.servers[r][d].forEach(s => {
          if (!this.datacenters[d])
            this.datacenters[d] = []
          this.datacenters[d].push({ server: s, region: r });
        });
      });
    });
  }

  ngOnInit() {
    const settings = this.settingsService.load();
    const sortOrder = settings.fflogsImport.sortOrderAfterImport;

    this.container.classes = this.container.classes.sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));

    this.fflogsForm = this.formBuilder.group({
      bossAttacksSource: new FormControl(settings.fflogsImport.bossAttacksSource),
      characterName: new FormControl(settings.fflogsImport.characterName || ""),
      characterServer: new FormControl(settings.fflogsImport.characterRegion && settings.fflogsImport.characterServer ? (settings.fflogsImport.characterServer + "|" + settings.fflogsImport.characterRegion) : ""),
    }, {});
  }
    
  get ff() { return this.fflogsForm.controls; }
  
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.container.classes, event.previousIndex, event.currentIndex);
  }

  updateResult(settings: ISettings): void {
    settings.fflogsImport.bossAttacksSource = this.ff.bossAttacksSource.value;
    settings.fflogsImport.sortOrderAfterImport = this.container.classes.map(it => it.name);
    settings.fflogsImport.characterName = this.ff.characterName.value;

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
