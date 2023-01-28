import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { IJob, Role } from "src/core/Models";
import { IGameService } from "src/services/game.service-interface";
import { gameServiceToken } from "src/services/game.service-provider";
import { VisStorageService } from "src/services/VisStorageService";
import { PresenterManager } from "../../../core/PresentationManager";

@Component({
  selector: "addJob",
  templateUrl: "./addJob.component.html",
  styleUrls: ["./addJob.component.css"],
})
export class AddJobComponent {
  public presenterManager: PresenterManager;
  roles: Role[];
  jobs: IJob[];
  visible: boolean;

  @Output() public added: EventEmitter<string> = new EventEmitter();

  constructor(
    private visStorage: VisStorageService,
    @Inject(gameServiceToken) public gameService: IGameService
  ) {
    this.presenterManager = this.visStorage.presenter;
    this.roles = [Role.Tank, Role.Healer, Role.Melee, Role.Range, Role.Caster];
    this.jobs = this.gameService.jobRegistry.getJobs();
  }

  change(ev) {
    this.visible = ev;
  }

  onAddJob(name: string) {
    this.added.emit(name);
    this.visible = false;
  }

  getJobName(job: IJob) {
    return job.translation
      ? job.translation[this.presenterManager.language]
      : job.name;
  }
}
