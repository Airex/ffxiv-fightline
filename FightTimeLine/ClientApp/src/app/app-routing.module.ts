import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FightLineComponent } from "../pages/fightline/fightline.component";
import { TableViewComponent } from "../pages/tableview/tableview.component";
import { HomeComponent } from "../pages/home/home.component";

const routes: Routes = [
  
  { path: "fflogs/:code/:fight", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
  { path: "fflogs/:code", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
  { path: "boss/:boss", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
  { path: "table/:fightId/:template", component: TableViewComponent },  
  { path: ":fightId", component: FightLineComponent, /*canDeactivate: [CanDeactivateUnsaved]*/ },
  { path: "", component: HomeComponent },
  { path: "**", redirectTo: "" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
