import { Component, Inject, EventEmitter, ViewChild, Output, Input, OnInit } from "@angular/core";
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes
} from '@angular/animations';


@Component({
  selector: "avatarWithPing",
  templateUrl: "./ping.component.html",
  styleUrls: ["./ping.component.css"],
  animations: [
    trigger('ping', [
      state('start', style({})),
      state('end', style({})),
      transition('start => end', [
        animate('0.5s', keyframes([          
          style({ transform: 'rotate(0deg)' }),
          style({ transform: 'rotate(360deg)' }),
        ]))
      ]),
      transition('end => start', [])  
    ])
  ]
})
export class PingComponent implements OnInit {

  avatarColors = ["#FFB6C1", "#2c3e50", "#95a5a6", "#f39c12", "#1abc9c"];

  ngOnInit(): void {
    this.compactname = this.name.split(" ").map(s => s[0].toUpperCase()).join("");
  }

  @Input('owner') public owner: boolean;
  @Input('name') public name: string;
  @Input('id') public id: string;
  pinged: boolean = false;
  compactname: string;

  public ping() {
    this.pinged = true;
  }

  onAnimationEvent() {
    this.pinged = false;
  }

  clicked() {
    this.ping();
  }
}

