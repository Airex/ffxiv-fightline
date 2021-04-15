import { ISettings } from "src/services/SettingsService";

export interface ISettingTab {
    updateResult(settings: ISettings)
}