import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
import * as Dataserviceinterface from "./data.service-interface";

export interface IGameService {
  jobRegistry: Jobregistryserviceinterface.IJobRegistryService;
  name: string;
  dataService: Dataserviceinterface.IDataService;
  showImport: boolean;
}


