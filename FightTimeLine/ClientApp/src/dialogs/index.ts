import { BossAttackDialog } from "./bossAttackDialog/bossAttackDialog.component"
import { BossTemplatesDialog } from "./bossTemplatesDialog/bossTemplatesDialog.component"
import { ExportToTableDialog } from "./exportToTableDialog/exportToTableDialog.component"
import { FFLogsImportDialog } from "./ffLogsImportDialog/ffLogsImportDialog.component"
import { FightLoadDialog } from "./fightLoadDialog/fightLoadDialog.component"
import { FightSaveDialog } from "./fightSaveDialog/fightSaveDialog.component"
import { HelpDialog } from "./helpDialog/helpDialog.component"
import { LoadingDialog } from "./loadingDialog/loadingDialog.component"
import { LoginDialog } from "./loginDialog/loginDialog.component"
import { RegisterDialog } from "./registerDialog/registerDialog.component"
import { SettingsDialog } from "./settingsDialog/settingsDialog.component"
import { TableViewDialog } from "./tableViewDialog/tableViewDialog.component"
import { WhatsNewDialog } from "./whatsNewDialog/whatsNewDialog.component"
import { BossSaveDialog } from "./bossSaveDialog/bossSaveDialog.component"
import { CharacterDialogComponent } from "./character-dialog/character-dialog.component"

export {
  BossAttackDialog,
  BossTemplatesDialog,
  ExportToTableDialog,
  FFLogsImportDialog,
  FightLoadDialog,
  FightSaveDialog,
  HelpDialog,
  LoadingDialog,
  LoginDialog,
  RegisterDialog,
  CharacterDialogComponent,  
  SettingsDialog,
  TableViewDialog,
  WhatsNewDialog,
  BossSaveDialog,
}

export const DialogsModuleComponents =
  [
    BossAttackDialog,
    HelpDialog,
    FightLoadDialog,
    BossSaveDialog,
    FightSaveDialog,
    SettingsDialog,    
    FFLogsImportDialog,
    LoadingDialog,
    LoginDialog,
    CharacterDialogComponent,
    RegisterDialog,
    ExportToTableDialog,
    TableViewDialog,
    BossTemplatesDialog,
    WhatsNewDialog    
  ];

