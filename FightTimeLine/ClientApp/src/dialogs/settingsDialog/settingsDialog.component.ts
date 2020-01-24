import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, HostListener, Inject, EventEmitter, TemplateRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { SettingsFilterComponent } from "./filter/settingsFilter.component"
import { SettingsViewComponent } from "./view/settingsView.component"
import { SettingsService, ISettings } from "../../services/SettingsService";
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzModalRef } from "ng-zorro-antd";
import * as Gameserviceinterface from "../../services/game.service-interface";
import * as Gameserviceprovider from "../../services/game.service-provider";
import * as Dispatcherservice from "../../services/dispatcher.service";


@Component({
  selector: "settingsDialog",
  templateUrl: "./settingsDialog.component.html",
  styleUrls: ["./settingsDialog.component.css"]
})

export class SettingsDialog {

  mainForm: FormGroup;
  fflogsForm: FormGroup;
  teamworkForm: FormGroup;
  tableViewForm: FormGroup;
  colorsForm: FormGroup;

  colorDisplayNames: { [t: string]: string } = {
    SelfShield: "Self Shield",
    Healing: "Healing",
    HealingBuff: "Healing Buff",
    PartyDamageBuff: "Party Damage Buff",
    PartyDefense: "Party Defense",
    PartyShield: "Party Shield",
    SelfDamageBuff: "Self Damage Buff",
    SelfDefense: "Self Defense",
    TargetDefense: "Target Defense",
    Utility: "Utility"
  }

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

  @ViewChild("filter", { static: true })
  filter: SettingsFilterComponent;
  @ViewChild("view", { static: true })
  view: SettingsViewComponent;

  @ViewChild("buttonsTemplate", { static: true }) buttonsTemplate: TemplateRef<any>;

  colors: any[];

  constructor(
    private dialogRef: NzModalRef,
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private dispatcher: Dispatcherservice.DispatcherService,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService,
    private notifications: ScreenNotificationsService) {

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

    this.dialogRef.getInstance().nzFooter = this.buttonsTemplate;

    const settings = this.settingsService.load();
    const sortOrder = settings.fflogsImport.sortOrderAfterImport;

    this.container.classes = this.container.classes.sort((a, b) => sortOrder.indexOf(a.name) - sortOrder.indexOf(b.name));
    this.filter.set(settings.main.defaultFilter);
    this.view.set(settings.main.defaultView);
    this.colors = Object.keys(settings.colors).map(it => {
      return {
        name: it,
        color: settings.colors[it]
      }
    });

    this.mainForm = this.formBuilder.group({}, {});
    this.fflogsForm = this.formBuilder.group({
      bossAttacksSource: new FormControl(settings.fflogsImport.bossAttacksSource),
      characterName: new FormControl(settings.fflogsImport.characterName || ""),
      characterServer: new FormControl(settings.fflogsImport.characterRegion && settings.fflogsImport.characterServer ? (settings.fflogsImport.characterServer + "|" + settings.fflogsImport.characterRegion) : ""),
    }, {});
    this.teamworkForm = this.formBuilder.group({
      displayName: new FormControl(settings.teamwork.displayName || "")
    }, {});
    this.tableViewForm = this.formBuilder.group({}, {});
    this.colorsForm = this.formBuilder.group({}, {});
  }

  get mf() { return this.mainForm.controls; }
  get ff() { return this.fflogsForm.controls; }
  get tf() { return this.teamworkForm.controls; }
  get tvf() { return this.tableViewForm.controls; }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.container.classes, event.previousIndex, event.currentIndex);
  }

  onYesClick() {

    const settings = this.settingsService.load();
    this.updateResult(settings);
    this.settingsService.save(settings);
    this.dialogRef.destroy();
    this.dispatcher.dispatch({
      name: "SettingsUpdate",
      payload: null
    });

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

    settings.main.defaultView = this.view.get();
    settings.main.defaultFilter = this.filter.get();

    settings.teamwork.displayName = this.tf.displayName.value;
    settings.colors = this.colors.reduce((p, c) => {
      p[c.name] = c.color;
      return p;
    },
      {});
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }

  onClearCachesClick(): void {
    localStorage.removeItem("events_cache");
    localStorage.removeItem("zones_cache");
    localStorage.removeItem("fights_cache");
    this.notifications.info("Caches have been cleared.");
  }
}
