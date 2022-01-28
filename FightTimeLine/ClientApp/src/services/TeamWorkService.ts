//import { Injectable, Output, EventEmitter } from "@angular/core";
//import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from "@aspnet/signalr"
//
//
//@Injectable()
//export class TeamWorkService {
//
//  private session: string;
//  private hubConnection: HubConnection;
//  private dataSynced = false;
//  private connectedUsers: { id: string, name: string, owner: boolean }[] = [];
//
//  public get connected(): boolean {
//    return this.hubConnection && this.hubConnection.state === HubConnectionState.Connected;
//  }
//
//  public get users(): any[] {
//    return this.connectedUsers;
//  }
//
//  @Output("connectedChanged") connectedChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
//  @Output("usersChanged") usersChanged: EventEmitter<any> = new EventEmitter<any>();
//  
//  sendCommand(data: any) {
//    if (this.connected) {
//      this.hubConnection.invoke("command", this.session, data);
//    }
//  }
//
//  private createConnection(): HubConnection {
//    this.hubConnection = new HubConnectionBuilder()
//      .configureLogging(LogLevel.Information)
//      .withUrl("/hub")
//      .build();
//    return this.hubConnection;
//  }
//
//  disconnect(): void {
//    if (this.connected) {
//      this.hubConnection.invoke("disconnect", this.session).then(value => {
//        this.hubConnection.stop().then(() => {
//          this.connectedChanged.emit(false);
//          this.connectedUsers = [];
//          this.usersChanged.emit();
//        });
//      });
//    }
//  }
//
//  startSession(username: string, handlers: IStartSessionHandlers): Promise<string> {
//    const connection = this.createConnection();
//    connection.on("sync",
//      () => {
//        this.hubConnection.invoke("sync", this.session, handlers && handlers.onSync());
//      });
//    connection.on("connected",
//      (data) => {
//        this.connectedUsers.push(data);
//        this.usersChanged.emit();
//        this.hubConnection.invoke("syncUsers", this.session, this.connectedUsers);
//        if (handlers && handlers.onConnected)
//          handlers.onConnected(data.name);
//      });
//    connection.on("disconnected",
//      (data) => {
//        this.connectedUsers.splice(this.connectedUsers.findIndex((it => it.name === data) as any), 1);
//        this.hubConnection.invoke("syncUsers", this.session, this.connectedUsers);
//        this.usersChanged.emit();
//        if (handlers && handlers.onDisconnected)
//          handlers.onDisconnected(data.name);
//      });
//    this.attachHandlers(connection, handlers);
//
//    return new Promise((resolve, reject) => {
//      connection.start()
//        .then((res) => {
//          this.connectedChanged.emit(true);
//          this.connectedUsers.push({ id: "", name: username, owner : true });
//          this.usersChanged.emit();
//          this.hubConnection
//            .invoke("startSession", username)
//            .then((result) => {
//              this.session = result;
//              console.log(result);
//              resolve(result);
//            })
//        })
//        .catch((err) => {
//          this.connectedChanged.emit(false);
//          console.error(err);
//          reject(err);
//        });
//    });
//  }
//
//  attachHandlers(connection: HubConnection, handlers: ISessionHandlers): void {
//    connection.on("command",
//      (data, user) => {
//        if (handlers && handlers.onCommand)
//          handlers.onCommand(data, user);
//      });
//  }
//
//  connectToSession(sessionId: string, username: string, handlers: IConnectToSessionHandlers): Promise<any> {
//    this.session = sessionId || prompt("session code");
//    if (this.session) {
//      const connection = this.createConnection();
//      connection.on("datasync",
//        (data) => {
//          if (!this.dataSynced) {
//            if (handlers && handlers.onDataSync)
//              handlers.onDataSync(data);
//            this.dataSynced = true;
//          }
//        });
//      connection.on("connected",
//        (data) => {
//          if (handlers && handlers.onConnected)
//            handlers.onConnected(data.name);
//        });
//      connection.on("disconnected",
//        (data) => {
//          if (data.owner) {
//            this.disconnect();
//            if (handlers && handlers.onDisconnected)
//              handlers.onDisconnected("Host");
//          } else {
//            if (handlers && handlers.onDisconnected)
//              handlers.onDisconnected(data.name);
//          }
//        });
//      connection.on("syncUsers",
//        (data) => {
//          this.connectedUsers = data;
//          this.usersChanged.emit();
//        });
//
//      this.attachHandlers(connection, handlers);
//
//      return new Promise<any>((resolve, reject) => {
//        connection.start()
//          .then(() => {
//            this.connectedChanged.emit(true);
//            this.hubConnection.invoke("connect", this.session, username)
//              .then(() => {
//                console.log("connected");
//                resolve();
//              })
//              .catch((err) => {
//                console.error(err);
//                reject(err);
//              });
//          })
//          .catch(err => {
//            this.connectedChanged.emit(false);
//            reject(err);
//          });
//      });
//
//    }
//    return Promise.reject();
//  }
//}
//
//export interface IStartSessionHandlers extends ISessionHandlers {
//  onSync?: () => any;
//}
//
//export interface IConnectToSessionHandlers extends ISessionHandlers {
//  onDataSync?: (data: any) => void;
//}
//
//interface ISessionHandlers {
//  onCommand?: (data: any, username: string) => void;
//  onConnected?: (data: any) => void;
//  onDisconnected?: (data: any) => void;
//}
