import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter, Inject, ElementRef, ComponentFactoryResolver, Injector, ApplicationRef, AfterViewInit, ViewContainerRef, Renderer2 } from "@angular/core";
import { Router } from "@angular/router";
import { DialogService } from "../services/index"
import { ScreenNotificationsService } from "../services/ScreenNotificationsService"
import { LocalStorageService } from "../services/LocalStorageService"
import { IAuthenticationService, authenticationServiceToken, ChangeNotesService } from "../services/index"
import * as Gameserviceprovider from "../services/game.service-provider";
import * as Gameserviceinterface from "../services/game.service-interface";
import * as _ from "lodash";

@Component({
  selector: "toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.css"],
})
export class ToolbarComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input("showHome") showHome: boolean;
  @Input("showRefresh") showRefresh: boolean;
  @Output("refresh") refresh: EventEmitter<void> = new EventEmitter<void>();

  container = { data: [] };

  public constructor(
    private dialogService: DialogService,
    @Inject(authenticationServiceToken) public authenticationService: IAuthenticationService,
    @Inject(Gameserviceprovider.gameServiceToken) public gameService: Gameserviceinterface.IGameService,
    private notification: ScreenNotificationsService,
    private changeNotesService: ChangeNotesService,
    private router: Router,
    private storage: LocalStorageService    
  ) {

  }
  ngAfterViewInit(): void {
  }

  onHome() {
    this.router.navigateByUrl("/");
  }

  onRefresh() {
    this.refresh.emit();
  }

  ngOnInit(): void {

  }  

  ngOnDestroy(): void {

  } 

  openSettings(): void {
    this.dialogService.openSettings();
  }
  

  showWhatsNewInt() {
    this.changeNotesService.load(true)
      .then(value => {
        this.dialogService.openWhatsNew(null, value);
      });
  }

  gotoDiscord() {
    window.open("https://discord.gg/xRppKj4", "_blank");
  }

  gotoGithub() {
    window.open("https://github.com/Airex/ffxiv-fightline/issues", "_blank");
  }


  privacy() {
    window.open("/privacy", "_blank");
  }

  showHelp(): Promise<void> {
    return this.dialogService.openHelp();
  }

  login() {
    this.dialogService.openLogin();
  }

  register() {
    this.dialogService.openRegister()
      .then(result => {
        if (result)
          this.authenticationService
            .login(result.username, result.password)
            .subscribe((): void => {
            });
      });
  }

  changeTheme() {    
    (window as any).changeTheme(this.darkTheme ? "default" : "dark");
  }


  logout() {
    this.authenticationService.logout();
  }
  get darkTheme() {
    return localStorage.getItem("theme") === "dark";
  }

  onLoad(): void {
    if (!this.authenticationService.authenticated) {
      this.notification.showSignInRequired(() => { this.login(); });
    } else {
      this.dialogService.openLoad();
    }
  }
}
