import { Component, OnInit } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import { Usuario } from 'src/app/model/usuario';
import {LoginPublisher} from "../../../service/login-publisher.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private snackBar: MatSnackBar, private loginPublisher: LoginPublisher) { }

  usuarioLogado: Usuario = null;

  ngOnInit(): void {
    this.loginPublisher.addSubscriber(this);
    this.loginPublisher.verificaLogin(this);
  }

  updateSubscriber(usuarioLogado: Usuario) {
    this.usuarioLogado = usuarioLogado;
  }

  logout():void{
    if (this.usuarioLogado !== null){
      this.loginPublisher.logout();
      this.showMessage("Sessão Encerrada!")
    } else {
      this.showMessage("Não ha usuário logado!")
    }
  }

  showMessage(msg: string):void{
    this.snackBar.open(msg,'X', {duration:1500,
      horizontalPosition:"center",
      verticalPosition:"top"})
  }

  isPageLogin(): boolean {
    return window.location.pathname === '/login'
  }

}
