import { Component, Inject, Input, OnInit, TemplateRef, ViewChild, AfterViewInit } from "@angular/core";
import { FormControl } from "@angular/forms"
import { SpreadSheetsService } from "../../services/SpreadSheetsService"
import { ScreenNotificationsService } from "../../services/ScreenNotificationsService"
import { ExportTemplate, ExportData } from "../../core/BaseExportTemplate"
import { FirstTemplate } from "../../core/ExportTemplates/FirstTemplate"
import { EachRowOneSecondTemplate } from "../../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../../core/ExportTemplates/BossAttackDefensiveTemplate"
import { AuthService, GoogleLoginProvider, SocialUser } from "angularx-social-login";
import { NzModalRef } from "ng-zorro-antd";

@Component({
  selector: "exportToTableDialog",
  templateUrl: "./exportToTableDialog.component.html",
  styleUrls: ["./exportToTableDialog.component.css"]
})
export class ExportToTableDialog implements OnInit, AfterViewInit  {

  @Input("data") data: ExportData;
  @ViewChild("headerTemplate", { static: true }) headerTemplate: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private service: SpreadSheetsService,
    private notification: ScreenNotificationsService,
    public dialogRef:NzModalRef,
    @Inject("GOOGLE_API_CLIENT_KEY") public apiKey: string) {
  }

  exportTemplatesControl = new FormControl();

  url: string;
  user: SocialUser;
  loggedIn: boolean;
  templates: ExportTemplate[] = [new FirstTemplate(), new EachRowOneSecondTemplate(), new BossAttackDefensiveTemplate()];
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
    },0);

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
    this.service.create(this.user.authToken,
        this.templates.find(it => it.name === this.exportTemplatesControl.value).build(this.data))
      .subscribe(ev => {
          this.url = ev.spreadsheetUrl;
          console.log(ev);
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
