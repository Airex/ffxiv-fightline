import { Injectable, Inject } from '@angular/core';
import * as Gameserviceinterface from "./game.service-interface";
import { IJobRegistryService } from "./jobregistry.service-interface";
import * as Jobregistryffxivservice from "./jobregistry-ffxiv.service";
import { IDataService } from "./data.service-interface";
import { IFraction } from "../core/Models";
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './LocalStorageService';
import { FFLogsService } from './FFLogs-data.service';

@Injectable()
export class FFXIVGameService implements Gameserviceinterface.IGameService {
  extractFraction(game: string): IFraction {
    return null;
  }

  private readonly dataServiceValue: IDataService;
  private readonly jobRegistryValue: IJobRegistryService;


  constructor(
    private httpClient: HttpClient,
    @Inject("FFLogs_URL") private fflogsUrl: string,
    @Inject("FFLogs_API_KEY") private apiKey: string,
    private storage: LocalStorageService) {

    this.jobRegistryValue = new Jobregistryffxivservice.FFXIVJobRegistryService();
    this.dataServiceValue = new FFLogsService(
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


