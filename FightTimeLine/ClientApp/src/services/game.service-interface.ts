import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
import * as DataServiceInterface from "./data.service-interface";

export interface IGameService {
  jobRegistry: Jobregistryserviceinterface.IJobRegistryService;
  name: string;
  dataService: DataServiceInterface.IDataService;
  showImport: boolean;
}


