import { Injectable } from "@angular/core"
import * as H from "../core/Holders";
import { LocalStorageService } from "./LocalStorageService";
import { Observable } from "rxjs";
import * as D from "../dialogs"
import { NzModalService, NzModalState } from "ng-zorro-antd/modal";
import { IAbility, IAbilitySetting, ISettingData, IBoss, IBossAbility, IFight, IFraction, IJobStats } from "src/core/Models";
import { PresenterManager } from "src/core/PresentationManager";

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(
    private dialogs: NzModalService,
    private storage: LocalStorageService) {

  }

  public get isAnyDialogOpened(): boolean {
    return this.dialogs.openModals.some(m => m.getState() === NzModalState.OPEN);
  }

  dialog: any;


  openExportToTable(dataFn: () => any) {
    this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzTitle: "Export to table",
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false,
      nzContent: D.ExportToTableDialog,
      nzComponentParams: {
        data: dataFn()
      }
    });
  }

  openLogin() {
    const dialogRef = this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzContent: D.LoginDialog,
      nzTitle: "Login",
      nzWidth: 265,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false
    });
    dialogRef.afterClose.subscribe(result => {
      if (result && result.signup) {
        setTimeout(() => {
          this.openRegister();
        });
        return;
      }
    });
  }

  openRegister(): Promise<any> {

    const dialogRef = this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzTitle: "Register",
      nzContent: D.RegisterDialog,
      nzWidth: 355,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzMaskClosable: false
    });
    return this.toPromise(dialogRef.afterClose);
  }

  openBossAttackAddDialog(bossAbility: IBossAbility, presenter: PresenterManager, callBack: (b: any) => void): void {
    const dialogRef = this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzTitle: null,
      nzWidth: 700,
      nzClosable: false,
      nzMaskClosable: false,
      nzContent: D.BossAttackDialog,
      nzComponentParams: {
        data: bossAbility        
      }
    });

    dialogRef.afterClose.subscribe(result => {
      callBack(result);
    });
  }

  openCharacterDialog(jobStats: IJobStats, callBack: (b: {data: IJobStats}) => void): void {
    const dialogRef = this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzTitle: null,
      nzWidth: 450,
      nzClosable: false,
      nzMaskClosable: false,
      nzContent: D.CharacterDialogComponent,
      nzComponentParams: {
        data: jobStats        
      }
    });

    dialogRef.afterClose.subscribe(result => {
      callBack(result);
    });
  }

  // openAbilityEditDialog(data: { ability: IAbility, settings: IAbilitySetting[], values: IAbilitySettingData[] },
  //   callBack: (b: any) => void): void {
  //   const dialogRef = this.dialogs.create({
  //     nzWrapClassName: "vertical-center-modal",
  //     nzTitle: "Properties",
  //     nzContent: D.AbilityEditDialog,
  //     nzWidth: 700,
  //     nzClosable: false,
  //     nzKeyboard: false,
  //     nzOkDisabled: true,
  //     nzCancelDisabled: true,
  //     nzFooter: null,
  //     nzMaskClosable: false,
  //     nzComponentParams: {
  //       data: data
  //     }
  //   });

  //   dialogRef.afterClose.subscribe(result => {
  //     callBack(result);
  //   });
  // }

  openLoad(): void {
    this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzTitle: "Load",
      nzContent: D.FightLoadDialog,
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false
    });
  }

  openImportFromFFLogs(code: string = null): Promise<any> {

    const dialogRef = this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzTitle: "Import from FFLogs",
      nzWidth: 700,
      nzClosable: false,
      nzContent: D.FFLogsImportDialog,
      nzComponentParams: {
        code: code
      }
    });

    return this.toPromise(dialogRef.afterClose);
  }

  openSaveBoss(name: string): Promise<any> {
    const dialogref = this.dialogs.create({
      nzTitle: "Save",
      nzContent: D.BossSaveDialog,
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false,
      nzComponentParams: {
        data: name
      }
    });
    return this.toPromise(dialogref.afterClose);
  }

  openSaveFight(dataFn: () => any): Promise<IFight> {
    const dialogref = this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzTitle: "Save",
      nzContent: D.FightSaveDialog,
      nzWidth: 700,
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzCancelDisabled: true,
      nzFooter: null,
      nzMaskClosable: false,
      nzComponentParams: {
        data: dataFn()
      }
    });
    return this.toPromise(dialogref.afterClose);
  }

  private toPromise<T>(obs: Observable<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      obs.subscribe((data) => {
        resolve(data);
      }, (error) => {
        reject(error);
      });
    });
  }

  openHelp(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      const dialogRef = this.dialogs.create({
        nzWrapClassName: "vertical-center-modal",
        nzTitle: "Help",
        nzContent: D.HelpDialog,
        nzWidth: "80%",
        nzClosable: false,
        nzKeyboard: false,
        nzMaskClosable: false,
      });
      dialogRef.afterClose.subscribe(() => {
        this.storage.setString("help_shown", "yes");
        resolve();
      });
    });

    return promise;
  }

  openSettings(): void {
    this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzTitle: null,
      nzClassName: "settingsWindow",
      nzContent: D.SettingsDialog,
      nzWidth: "900px",
      nzClosable: false
    });
  }

  executeWithLoading(text: string, action: (ref: { close(): void }) => void) {
    let loadingDialogRef: any;
    setTimeout(() => {
      loadingDialogRef = this.dialogs.create({
        nzWrapClassName: "vertical-center-modal",
        nzContent: D.LoadingDialog,
        nzTitle: null,
        nzWidth: 150,
        nzClosable: false,
        nzKeyboard: false,
        nzOkDisabled: true,
        nzCancelDisabled: true,
        nzFooter: null,
        nzMaskClosable: false,
        nzComponentParams: {
          text: text
        }
      });

      loadingDialogRef.afterOpen.subscribe(() => {
        action({ close: () => loadingDialogRef.destroy() });
      });
    });
  }

  openTable(dataFn: () => any) {
    this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzContent: D.TableViewDialog,
      nzTitle: null,
      nzWidth: "99%",
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false,
      nzComponentParams: {
        data: dataFn()
      }
    });
  }

  openBossTemplates(needSave: boolean, boss?: IBoss) {
    this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzContent: D.BossTemplatesDialog,
      nzTitle: null,
      nzWidth: "90%",
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false,
      nzComponentParams: {
        data: {
          needSave: needSave,
          boss: boss
        }
      }
    });
  }

  openWhatsNew(change?: any, notes?: any): Promise<any> {
    const changes = change || notes;
    const ref = this.dialogs.create({
      nzWrapClassName: "vertical-center-modal",
      nzContent: D.WhatsNewDialog,
      nzTitle: "What's new",
      nzWidth: "90%",
      nzClosable: false,
      nzKeyboard: false,
      nzOkDisabled: true,
      nzMaskClosable: false,
      nzComponentParams: {
        data: changes
      }
    });
    return this.toPromise(ref.afterClose);
  }  
}
