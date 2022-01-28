import { IAuthenticationService } from "./authentication.service-interface"
import { authenticationServiceProvider, authenticationServiceToken } from "./authentication.service-provider"
import { IFightService } from "./fight.service-interface"
import { fightServiceToken, fightServiceProvider } from "./fight.service-provider"
import { DialogService } from "./DialogService"
import { RecentActivityService } from "./RecentActivitiesService"
import { SettingsService } from "./SettingsService"
import { SpreadSheetsService } from "./SpreadSheetsService"
import { UserService } from "./UserService"
import { ScreenNotificationsService } from "./ScreenNotificationsService"
import { LocalStorageService } from "./LocalStorageService"
import { DispatcherPayloads, DispatcherService } from "./dispatcher.service"
import { ChangeNotesService, IChahgeNote } from "./changeNotes.service"
import { FightHubService, IConnectToSessionHandlers, IStartSessionHandlers } from "./FightHubService"
import * as Gameserviceprovider from "./game.service-provider";
import { FFXIVApiService } from "./FFxivApiService"
import { VisStorageService } from "./VisStorageService"
import { UserStorageService } from "./UserStorageService"
import { SessionStorageService } from "./SessionStorageService"

export {
  IAuthenticationService,
  DialogService,  
  IFightService,
  RecentActivityService,
  SettingsService,
  SpreadSheetsService,
  UserService,
  ScreenNotificationsService,
  SessionStorageService,
  LocalStorageService,
  DispatcherService,
  IConnectToSessionHandlers,
  IStartSessionHandlers,
  authenticationServiceProvider,
  authenticationServiceToken,
  fightServiceProvider,
  fightServiceToken,
  FFXIVApiService,
  FightHubService,
  IChahgeNote,
  ChangeNotesService
}

export const ServicesModuleComponents =
  [
    DialogService,    
    RecentActivityService,
    SettingsService,
    SpreadSheetsService,
    UserService,
    ScreenNotificationsService,
    LocalStorageService,
    SessionStorageService,
    { provide: "DispatcherPayloads", useFactory: () => new DispatcherService<DispatcherPayloads>() },
    FightHubService,
    ChangeNotesService,
    authenticationServiceProvider,
    fightServiceProvider,
    Gameserviceprovider.gameServiceProvider,
    UserStorageService,
    VisStorageService,
    FFXIVApiService
  ];

