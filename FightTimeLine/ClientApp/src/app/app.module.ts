import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import {CommonModule} from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { VisModule } from "ngx-vis"
import { ContextMenuModule, ContextMenuService } from "ngx-contextmenu"
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FightLineComponent } from "../fightline/fightline.component";
import { TableViewComponent } from "../tableview/tableview.component";
//import { BossTemplateComponent } from "../bosstemplate/bosstemplate.component";
import { HomeComponent } from "../home/home.component";
import { FightLineContextMenuComponent } from "../fightline/contextmenu/contextmenu.component";
import { SidepanelComponent } from "../sidepanel/sidepanel.component";
import { FilterComponent } from "../fightline/filter/filter.component";
import { ViewComponent } from "../fightline/view/view.component";
import { SettingsFilterComponent } from "../dialogs/settingsDialog/filter/settingsFilter.component";
import { SettingsViewComponent } from "../dialogs/settingsDialog/view/settingsView.component";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { SyncSettingsComponent } from "../dialogs/bossAttackDialog/syncSettings/syncSettings.component";
import * as Services from "../services/index"
import { JwtInterceptor } from "../interceptors/jwtInterceptor"
import { ClipboardModule } from "ngx-clipboard";
import { NgProgressModule } from "ngx-progressbar";
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from "ng-recaptcha";
import { DialogsModuleComponents } from "../dialogs/index";
import { SingleAbilityComponent } from "../sidepanel/components/singleAbility/singleAbility.component";
import { SingleAttackComponent } from "../sidepanel/components/singleAttack/singleAttack.component";
import { MultipleAbilityComponent } from "../sidepanel/components/multipleAbility/multipleAbility.component";
import { MultipleAttackComponent } from "../sidepanel/components/multipleAttack/multipleAttack.component";
import { JobComponent } from "../sidepanel/components/job/job.component";
import { JobAbilityComponent } from "../sidepanel/components/jobAbility/jobAbility.component";
import { AreaComponent } from "../sidepanel/components/area/area.component";
import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import * as SocialLogins from "angularx-social-login";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OffsetWheelDirective } from "../heplers/OffsetWheelDirective"
import { FFLogsMatcherDirective } from "../heplers/FFLogsMatchDirective"
import { CustomScrollDirective } from "../heplers/customScroll.directive"
import { KeyHandlerDirective } from "../heplers/keyHandler.directive"
import { KillsOnlyPipe } from "../heplers/KillsPipe"
import { NoDraftsPipe } from "../heplers/NoDraftsPipe"
import { PingComponent } from "../fightline/ping/ping.component";
import * as Sentry from "@sentry/browser";
import { AngularSplitModule } from 'angular-split';
import { environment } from "../environments/environment"
import { XivapiClientModule } from "@xivapi/angular-client";
import { en_US, NgZorroAntdModule, NZ_I18N } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import { DisqusModule, DISQUS_SHORTNAME } from "ngx-disqus"
import { ColorPickerModule } from 'ngx-color-picker';
import en from '@angular/common/locales/en'

registerLocaleData(en);

Sentry.init(<Object>{
  dsn : "https://aa772d49f3bb4a33851f765d5d5f2d86@sentry.io/1407389",
  enabled : environment.production
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  handleError(error) {
    Sentry.captureException(error.originalError || error);
    throw error;
  }
}



const googleLoginOptions: SocialLogins.LoginOpt = {
  scope: "https://www.googleapis.com/auth/spreadsheets"
};

let config = new AuthServiceConfig([
  {
    id: SocialLogins.GoogleLoginProvider.PROVIDER_ID,
    provider: new SocialLogins.GoogleLoginProvider("1081155249988-uqcf81fhlvbbbllakefqbtmjcja9sva8.apps.googleusercontent.com", googleLoginOptions)
  }
]);

export function provideConfig() {
  return config;
}

export function getBaseUrl() {
  return document.getElementsByTagName("base")[0].href;
}


@NgModule({
  declarations: [
    KeyHandlerDirective,
    AreaComponent,
    AppComponent,
    FightLineComponent,
    ToolbarComponent,
//    BossTemplateComponent,
    FightLineContextMenuComponent,
    TableViewComponent,
    PingComponent,
    HomeComponent,
    FilterComponent,
    ViewComponent,
    SettingsFilterComponent,
    SettingsViewComponent,
    FilterComponent,
    ViewComponent,
    OffsetWheelDirective,
    FFLogsMatcherDirective,
    CustomScrollDirective,
    KillsOnlyPipe,
    NoDraftsPipe,
    SidepanelComponent,
    SingleAbilityComponent,
    SingleAttackComponent,
    MultipleAbilityComponent,
    MultipleAttackComponent,
    JobComponent,
    JobAbilityComponent,
    SyncSettingsComponent,
    ...DialogsModuleComponents
  ],
  imports: [
    CommonModule,
    NgZorroAntdModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    DragDropModule,
    ReactiveFormsModule,
    NgProgressModule,
    VisModule,
    ContextMenuModule,
    XivapiClientModule.forRoot(),
    RecaptchaModule,
    ClipboardModule,
    SocialLoginModule,
    AngularSplitModule,
    DisqusModule,
    ColorPickerModule
  ],
  providers: [
    ContextMenuService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: "BASE_URL", useFactory: getBaseUrl },
    { provide: "FFLogs_URL", useValue: "https://www.fflogs.com:443/" },
    { provide: "FFLogs_API_KEY", useValue: "66bfc666827c9b668f4daa87d019e714" },
    { provide: "GOOGLE_API_CLIENT_KEY", useValue: "1081155249988-uqcf81fhlvbbbllakefqbtmjcja9sva8.apps.googleusercontent.com" },
    { provide: "GOOGLE_API_SPREADSHEETS_URL", useValue: "https://sheets.googleapis.com/v4/spreadsheets" },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    { provide: AuthServiceConfig, useFactory: provideConfig },
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: '6LfToGAUAAAAAKcp3joBgzcqJ3sK_s_WCltAL7Tn' } as RecaptchaSettings,
    },
    { provide: NZ_I18N, useValue: en_US },
    { provide: DISQUS_SHORTNAME, useFactory: () => location.hostname.toLowerCase().indexOf("swtor") >= 0 ? "swtor-fightline" : "ffxiv-fightline" },
    ...Services.ServicesModuleComponents

  ],
  entryComponents: [
    ViewComponent, FilterComponent, SettingsFilterComponent, AreaComponent, SettingsViewComponent, PingComponent, SingleAbilityComponent,
    SingleAttackComponent, MultipleAbilityComponent, MultipleAttackComponent, SyncSettingsComponent, JobComponent, JobAbilityComponent,
    ...DialogsModuleComponents
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


