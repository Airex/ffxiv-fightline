import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { PortalModule } from "@angular/cdk/portal";
import { VisModule } from "ngx-vis"
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FightLineComponent } from "../pages/fightline/fightline.component";
import { TableViewComponent } from "../pages/tableview/tableview.component";
import { CellComponent } from "../pages/tableview/cell/cell.component";
//import { BossTemplateComponent } from "../bosstemplate/bosstemplate.component";
import { HomeComponent } from "../pages/home/home.component";
import { SidepanelComponent } from "../components/sidepanel/sidepanel.component";
import { PlanAreaComponent } from "../pages/fightline/planArea/planArea.component";
import { FilterComponent } from "../pages/fightline/filter/filter.component";
import { ViewComponent } from "../pages/fightline/view/view.component";
import { SettingsFilterComponent } from "../dialogs/settingsDialog/filter/settingsFilter.component";
import { SettingsViewComponent } from "../dialogs/settingsDialog/view/settingsView.component";
import { ToolbarComponent } from "../components/toolbar/toolbar.component";
import { SyncSettingsComponent } from "../dialogs/bossAttackDialog/syncSettings/syncSettings.component";
import { SyncDowntimeComponent } from "../dialogs/bossAttackDialog/syncDowntime/syncDowntime.component";
import * as Services from "../services/index"
import { JwtInterceptor } from "../interceptors/jwtInterceptor"
import { ClipboardModule } from "ngx-clipboard";
import { NgProgressModule } from "ngx-progressbar";
import { NgxCaptchaModule } from "ngx-captcha";
import { DialogsModuleComponents } from "../dialogs/index";
import { SingleAbilityComponent } from "../components/singleAbility/singleAbility.component";
import { SingleAttackComponent } from "../components/singleAttack/singleAttack.component";
import { MultipleAbilityComponent } from "../components/multipleAbility/multipleAbility.component";
import { MultipleAttackComponent } from "../components/multipleAttack/multipleAttack.component";
import { JobComponent } from "../components/job/job.component";
import { JobAbilityComponent } from "../components/jobAbility/jobAbility.component";
import { DownTimeComponent } from "../components/downtime/downtime.component";
import { MultipleDownTimeComponent } from "../components/multipleDowntime/multipleDowntime.component";
import { AreaComponent } from "../components/area/area.component";
import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import * as SocialLogins from "angularx-social-login";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OffsetWheelDirective } from "../heplers/OffsetWheelDirective"
import { FFLogsMatcherDirective } from "../heplers/FFLogsMatchDirective"
import { CustomScrollDirective } from "../heplers/customScroll.directive"
import { KeyHandlerDirective } from "../heplers/keyHandler.directive"
import { KillsOnlyPipe } from "../heplers/KillsPipe"
import { NoDraftsPipe } from "../heplers/NoDraftsPipe"
import { PingComponent } from "../components/ping/ping.component";
import * as Sentry from "@sentry/browser";
import { AngularSplitModule } from 'angular-split';
import { environment } from "../environments/environment"
import { XivapiClientModule } from "@xivapi/angular-client";

import { registerLocaleData } from '@angular/common';
import { DisqusModule, DISQUS_SHORTNAME } from "ngx-disqus"
import { ColorPickerModule } from 'ngx-color-picker';
import en from '@angular/common/locales/en'

import { NzAlertModule } from 'ng-zorro-antd/alert';

import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';
import { NzTransButtonModule } from 'ng-zorro-antd/core/trans-button';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { en_US, NzI18nModule, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from "ng-zorro-antd/space";
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { SoloPartyPipe } from 'src/heplers/SoloPartyPipe';
import { VisStorageService } from 'src/services/VisStorageService';
import { SettingsDialogMainTab } from 'src/dialogs/settingsDialog/tabs/main/main.component';
import { SettingsDialogColorTab } from 'src/dialogs/settingsDialog/tabs/colors/colors.component';
import { SettingsDialogFflogsTab } from 'src/dialogs/settingsDialog/tabs/fflogs/fflogs.component';
import { SettingsDialogTableviewTab } from 'src/dialogs/settingsDialog/tabs/tableview/tableview.component';
import { SettingsDialogTeamworkTab } from 'src/dialogs/settingsDialog/tabs/teamwork/teamwork.component';
import { SettingsDialogPresetsTab } from 'src/dialogs/settingsDialog/tabs/presets/presets.component';
import { AddJobComponent } from '../pages/fightline/addJob/addJob.component';
import { JobRolePipe } from 'src/heplers/JobRolePipe';
import { TableViewOptionsComponent } from 'src/components/tableviewoptions/tableviewoptions.component';

const zorroModules = [
  NzAlertModule,
  NzAutocompleteModule,
  NzAvatarModule,
  NzBadgeModule,
  NzButtonModule,
  NzCardModule,
  NzCarouselModule,
  NzCascaderModule,
  NzCheckboxModule,
  NzCollapseModule,
  NzDatePickerModule,
  NzDividerModule,
  NzDrawerModule,
  NzDropDownModule,
  NzEmptyModule,
  NzFormModule,
  NzGridModule,
  NzI18nModule,
  NzIconModule,
  NzInputModule,
  NzInputNumberModule,
  NzLayoutModule,
  NzListModule,
  NzMenuModule,
  NzMessageModule,
  NzModalModule,
  NzNoAnimationModule,
  NzNotificationModule,
  NzPageHeaderModule,
  NzPaginationModule,
  NzPopconfirmModule,
  NzPopoverModule,
  NzProgressModule,
  NzRadioModule,
  NzResultModule,
  NzSelectModule,
  NzSliderModule,
  NzSpaceModule,
  NzSpinModule,
  NzStatisticModule,
  NzSwitchModule,
  NzTableModule,
  NzTabsModule,
  NzTagModule,
  NzTimePickerModule,
  NzTimelineModule,
  NzToolTipModule,
  NzTransButtonModule,
  NzTreeModule,
  NzTreeSelectModule,
  NzWaveModule,
  NzResizableModule

];


registerLocaleData(en);

Sentry.init(<Object>{
  dsn: "https://aa772d49f3bb4a33851f765d5d5f2d86@sentry.io/1407389",
  enabled: environment.production
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
  return environment.baseUrl;
}




@NgModule({
    declarations: [
        //    BossTemplateComponent,
        AddJobComponent,
        AppComponent,
        AreaComponent,
        CellComponent,
        CustomScrollDirective,
        DownTimeComponent,
        FFLogsMatcherDirective,
        FightLineComponent,
        FilterComponent,
        FilterComponent,
        HomeComponent,
        JobAbilityComponent,
        JobComponent,
        JobRolePipe,
        KeyHandlerDirective,
        KillsOnlyPipe,
        MultipleAbilityComponent,
        MultipleAttackComponent,
        MultipleDownTimeComponent,
        NoDraftsPipe,
        OffsetWheelDirective,
        PingComponent,
        PlanAreaComponent,
        SettingsDialogColorTab,
        SettingsDialogFflogsTab,
        SettingsDialogMainTab,
        SettingsDialogPresetsTab,
        SettingsDialogTableviewTab,
        SettingsDialogTeamworkTab,
        SettingsFilterComponent,
        SettingsViewComponent,
        SidepanelComponent,
        SingleAbilityComponent,
        SingleAttackComponent,
        SoloPartyPipe,
        SyncDowntimeComponent,
        SyncSettingsComponent,
        TableViewComponent,
        TableViewOptionsComponent,
        ToolbarComponent,
        ViewComponent,
        ViewComponent,
        ...DialogsModuleComponents
    ],
    imports: [
        AngularSplitModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        ClipboardModule,
        ColorPickerModule,
        CommonModule,
        DisqusModule,
        DragDropModule,
        FormsModule,
        HttpClientModule,
        NgProgressModule,
        NgxCaptchaModule,
        PortalModule,
        ReactiveFormsModule,
        SocialLoginModule,
        VisModule,
        XivapiClientModule.forRoot(),
        ...zorroModules
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: "BASE_URL", useFactory: getBaseUrl },
        { provide: "FFLogs_URL", useValue: "https://www.fflogs.com:443/" },
        { provide: "FFLogs_API_KEY", useValue: "66bfc666827c9b668f4daa87d019e714" },
        { provide: "GOOGLE_API_CLIENT_KEY", useValue: "1081155249988-uqcf81fhlvbbbllakefqbtmjcja9sva8.apps.googleusercontent.com" },
        { provide: "GOOGLE_API_SPREADSHEETS_URL", useValue: "https://sheets.googleapis.com/v4/spreadsheets" },
        { provide: ErrorHandler, useClass: SentryErrorHandler },
        { provide: AuthServiceConfig, useFactory: provideConfig },
        { provide: NZ_I18N, useValue: en_US },
        { provide: DISQUS_SHORTNAME, useValue: "ffxiv-fightline" },
        ...Services.ServicesModuleComponents,
        VisStorageService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }


