import { Component, Inject, Input, OnInit, TemplateRef, ViewChild, AfterViewInit } from "@angular/core";
import { FormControl } from "@angular/forms"
import { SpreadSheetsService } from "../../services/SpreadSheetsService"
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"
import { ExportTemplate } from "../../core/BaseExportTemplate"
import { BossAttackDefensiveTemplateV2 } from "../../core/ExportTemplates/BossAttackDefensiveTemplate"
import { AuthService, GoogleLoginProvider, SocialUser } from "angularx-social-login";
import { NzModalRef } from "ng-zorro-antd/modal";
import { ExportData } from "src/core/ExportModels";
import { gameServiceToken } from "src/services/game.service-provider";
import { IGameService } from "src/services/game.service-interface";
import { MitigationsTemplate } from "src/core/ExportTemplates/MitigationsTemplate";
import { DescriptiveTemplate } from "src/core/ExportTemplates/DescriptiveTemplate";

@Component({
  selector: "exportToTableDialog",
  templateUrl: "./exportToTableDialog.component.html",
  styleUrls: ["./exportToTableDialog.component.css"]
})
export class ExportToTableDialog implements OnInit, AfterViewInit {

  @Input("data") data: ExportData;
  @ViewChild("headerTemplate", { static: true }) headerTemplate: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private service: SpreadSheetsService,
    private notification: ScreenNotificationsService,
    @Inject(gameServiceToken) private gameService: IGameService,
    public dialogRef: NzModalRef,
    @Inject("GOOGLE_API_CLIENT_KEY") public apiKey: string) {
  }

  exportTemplatesControl = new FormControl();

  url: string;
  user: SocialUser;
  loggedIn: boolean;
  templates: ExportTemplate[] = [new BossAttackDefensiveTemplateV2(), new MitigationsTemplate(), new DescriptiveTemplate()];
  scope = [
    "https://www.googleapis.com/auth/spreadsheets",
  ].join(" ");

  ngOnInit(): void {


    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    }, err => {
      console.log(err);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dialogRef.getConfig().nzTitle = this.headerTemplate;
    }, 0);

  }

  signinWithGoogle(): void {
    if (!this.loggedIn)
      this.authService.signIn(GoogleLoginProvider.PROVIDER_ID,
        {
          scope: this.scope
        });
  }

  export() {
    if (!this.exportTemplatesControl.value) return;
    const context = { data: this.data, presenter: null, jobRegistry: this.gameService.jobRegistry, options: null, holders: null };
    this.service.create(this.user.authToken,
      this
        .templates.find(it => it.name === this.exportTemplatesControl.value)
        .buildTable(context))
      .subscribe(ev => {
        this.url = ev.spreadsheetUrl;
        // console.log(ev);
      },
        ev => {
          this.authService.signOut();
        });
  }

  onCopied() {
    this.notification.info("URL has been copied");
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close();
  }
}
