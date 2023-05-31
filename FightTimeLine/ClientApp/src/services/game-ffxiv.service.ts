import { Injectable, Inject } from '@angular/core';
import { IJobRegistryService } from "./jobregistry.service-interface";
import { IDataService } from "./data.service-interface";
import { IFraction } from "../core/Models";
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './LocalStorageService';
import { FFLogsService } from './FFLogs-data.service';
import { SettingsService } from './SettingsService';
import { IGameService } from './game.service-interface';
import { FFXIVJobRegistryService } from './jobregistry-ffxiv.service';

@Injectable()
export class FFXIVGameService implements IGameService {
  private readonly dataServiceValue: IDataService;
  private readonly jobRegistryValue: IJobRegistryService;


  constructor(
    private httpClient: HttpClient,
    @Inject("FFLogs_URL") private fflogsUrl: string,
    @Inject("FFLogs_API_KEY") private apiKey: string,
    private settings: SettingsService,
    private storage: LocalStorageService) {

    this.jobRegistryValue = new FFXIVJobRegistryService();
    this.dataServiceValue = new FFLogsService(
      this.jobRegistryValue,
      this.httpClient,
      this.fflogsUrl,
      this.apiKey,
      this.settings,
      this.storage);

  }

  extractFraction(game: string): IFraction {
    return null;
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


