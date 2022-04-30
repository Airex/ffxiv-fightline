import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recent-list',
  templateUrl: './recent-list.component.html',
  styleUrls: ['./recent-list.component.css']
})
export class RecentListComponent {

  @Input() data: any[] = [];
  @Input() header: string;

  @Output() changed: EventEmitter<void> = new EventEmitter<void>();
  @Output() pinChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() deleted: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private router: Router
  ) { }


  pin($event, item) {
    $event.stopPropagation();
    $event.preventDefault();
    this.pinChanged.emit(item.id);
  }

  unpin($event, item) {
    $event.stopPropagation();
    $event.preventDefault();

    this.pinChanged.emit(item.id);
  }

  delete(item) {
    this.deleted.emit(item.id);
  }

  listopentablevisiblechange(item: HTMLElement, visible: boolean) {
    item.className = visible ? "forcevisible" : "";
  }

  onOpenTable(item, name) {
    window.open("/table/" + item.id + "/" + name, "_blank");
  }

  onClick(url: string) {
    this.router.navigateByUrl(url);
  }

}
