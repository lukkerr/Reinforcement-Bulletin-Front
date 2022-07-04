import { Injectable } from '@angular/core';
import { Usuario } from "../model/usuario";
import { Login } from "../model/login";
import { first } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: 'root'
})
export class LoginPublisher {

  private usuarioLogado: Usuario = null;
  private subscribers: any[] = [];

  baseUrl = `${environment.api}/login`;


  constructor(private snackBar: MatSnackBar ,private http: HttpClient) { }


  showMessage(msg: string):void{
    this.snackBar.open(msg,'X', {duration:3000,
      horizontalPosition:"center",
      verticalPosition:"top"})
  }

  async fazerLogin(login: Login): Promise<string>{

    let logado;

    try {
      logado = await this.http.post<Object>(this.baseUrl, login).toPromise();
    } catch(e) {
      logado = e.error;
    }
    
    if(logado.error == null && Object.values(logado).filter(i => i !== null).length > 0) {
      localStorage.setItem("login", JSON.stringify(login));
      this.usuarioLogado = <Usuario> logado;
    }

    this.notifySubscribers();
    return logado.error;
  }

  async verificaLogin(subscriber: any): Promise<void> {
    if(this.usuarioLogado === null) {
      const userStorage = localStorage.getItem("login");
      if(userStorage !== null) {
        await this.fazerLogin( <Login> JSON.parse(userStorage) );
        if(!this.usuarioLogado)
          localStorage.removeItem("login");
      }
    }

    this.notifySubscriber(subscriber);
  }

  logout(): void {
    this.usuarioLogado = null;
    localStorage.removeItem("login");
    this.notifySubscribers();
  }

  addSubscriber(subscriber: any) {
    this.subscribers.push(subscriber);
    subscriber.updateSubscriber(this.usuarioLogado);
  }

  removeSubscriber(subscriber: any) {
    this.subscribers.filter(sub => sub !== subscriber);
  }

  notifySubscriber(subscriber: any) {
    subscriber.updateSubscriber(this.usuarioLogado);
  }

  notifySubscribers() {
    this.subscribers.forEach( s => s.updateSubscriber(this.usuarioLogado) );
  }

}

