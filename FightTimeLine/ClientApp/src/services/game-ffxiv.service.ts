import { Injectable, Inject } from '@angular/core';
import * as Gameserviceinterface from "./game.service-interface";
import { IJobRegistryService } from "./jobregistry.service-interface";
import * as Jobregistryffxivservice from "./jobregistry-ffxiv.service";
import { IDataService } from "./data.service-interface";
import * as FFLogsdataservice from "./FFLogs-data.service";
import * as Client from "@angular/common/http";
import * as SettingsService from "./SettingsService";
import * as LocalStorageService from "./LocalStorageService";
import { IFraction } from "../core/Models";

@Injectable()
export class FFXIVGameService implements Gameserviceinterface.IGameService {
  extractFraction(game: string): IFraction {
    return null;
  }

  private readonly dataServiceValue: IDataService;
  private readonly jobRegistryValue: IJobRegistryService;


  constructor(
    private httpClient: Client.HttpClient,
    @Inject("FFLogs_URL") private fflogsUrl: string,
    @Inject("FFLogs_API_KEY") private apiKey: string,
    private storage: LocalStorageService.LocalStorageService) {

    this.jobRegistryValue = new Jobregistryffxivservice.FFXIVJobRegistryService();
    this.dataServiceValue = new FFLogsdataservice.FFLogsService(
      this.jobRegistryValue,
      this.httpClient,
      this.fflogsUrl,
      this.apiKey,
      this.storage);
    
  }

  get fractions(): IFraction[] {
    return null;
  }

  get showImport(): boolean {
    return true;
  }

  get dataService(): IDataService {
    return this.dataServiceValue;
  }

  get name(): string {
    return "ffxiv";
  }

  get jobRegistry(): IJobRegistryService {
    return this.jobRegistryValue;
  }
}


