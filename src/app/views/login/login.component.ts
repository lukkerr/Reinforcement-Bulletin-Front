import { Component, OnInit } from '@angular/core';
import { LoginPublisher } from '../../service/login-publisher.service';
import { Login } from "../../model/login";
import { Usuario } from "../../model/usuario";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  login: Login = {
    cpf: '',
    senha: ''
  }
  usuarioLogado: Usuario = null;
  loaded: boolean = false;

  constructor(private loginPublisher: LoginPublisher, private router: Router ) { }

  ngOnInit(): void {
    this.loginPublisher.addSubscriber(this);
  }

  updateSubscriber(usuarioLogado: Usuario) {
    this.usuarioLogado = usuarioLogado;
    if(usuarioLogado)
      this.router.navigate(['/']);
    else
      this.loaded = true;
  }

  fazerLogin(): void {
    if ( this.login.cpf != null && this.login.senha != null &&
      this.login.cpf.trim().length == 11 && this.login.senha.trim().length >= 8 ) {
        if ( this.login.cpf.replace(/[0-9]/g, "").length === 0 ) {
          this.loginPublisher.fazerLogin(this.login).then(errorMessage => {
            if(errorMessage == null)
              this.loginPublisher.showMessage("Logado com Sucesso!");
            else
              this.loginPublisher.showMessage(errorMessage);
          });
        } else {
          this.loginPublisher.showMessage("Seu cpf deve possuir apenas números!");
        }
    } else {
      if (this.login.cpf.trim().length != 11)
        this.loginPublisher.showMessage("Seu cpf deve possuir 11 dígitos (apenas números)");
      else
        this.loginPublisher.showMessage("Sua senha deve possuir no mínimo de 8 dígitos");
    }
  }

  cancelar():void{
    this.router.navigate(['/'])
  }

}
