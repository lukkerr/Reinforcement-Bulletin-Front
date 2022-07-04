import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Usuario } from "../../model/usuario";
import { Router } from "@angular/router";
import { LoginPublisher } from "../../service/login-publisher.service";
import { FacadeService } from "../../service/facade.service";

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit {

  filterFields: string[] = ['CPF', 'Nome', 'E-mail', 'Telefone', 'Professor', 'Ativo'];
  filterField: string = '';
  filterUsuario: Usuario[] = [];
  usuarios: Usuario[] = [];
  flagShowPopup = false;
  flagShowConfirm = false;
  displayedColumns: string[] = ['cpf', 'nome', 'email', 'telefone', 'is_professor', 'ativo'];
  usuario: Usuario = null;
  eraseUsuario: Usuario = {
    cpf: null,
    nome: null,
    email: null,
    senha: null,
    telefone: null,
    is_professor: false,
    ativo: true
  };
  usuarioLogado: Usuario = null;
  loaded: boolean = false;
  popUpMode = null;
  changePassword: boolean = false;

  constructor(private facadeService: FacadeService, private router: Router, private loginPublisher: LoginPublisher) { }

  ngOnInit(): void {
    this.loginPublisher.addSubscriber(this);
    this.loginPublisher.verificaLogin(this);
  }

  updateSubscriber(usuarioLogado: Usuario) {
    this.usuarioLogado = usuarioLogado;
    if(usuarioLogado)
      this.updateLogado();
    else
      this.router.navigate(['login']);
  }

  async updateLogado() {
    this.getUsuarios();
    this.loaded = true;
  }

  showPopUp(mode: String, usuario: Usuario): void {
    this.flagShowPopup = !this.flagShowPopup;
    if(!this.flagShowPopup)
      this.flagShowConfirm = false;

    if(usuario == this.eraseUsuario)
      this.changePassword = false;

    this.popUpMode = mode;
    this.usuario = <Usuario> JSON.parse( JSON.stringify(usuario) );
  }

  async getUsuarios() {
    this.facadeService.read("usuario").subscribe((usuarios: Usuario[]) => {
      usuarios = usuarios.map(u => { u.old_cpf = u.cpf; return u });
      this.usuarios = usuarios;
      this.filterUsuario = usuarios;
    });

  }

  saveUser(buttonSalvar: MatButton, buttonCancelar: MatButton):void{
    if (this.usuarioLogado !== null && this.usuarioLogado.is_professor) {
      let usuarioObject: Object = <Object> this.usuario;

      if(!this.changePassword && this.popUpMode === 'edit') {
        delete usuarioObject["senha"];
      } else if (this.changePassword && this.popUpMode === 'edit') {
        usuarioObject["senha"] = this.usuario.senha;
      }

      if (this.popUpMode != 'edit')
        delete usuarioObject["old_cpf"];

      if( this.onlyNotBlankMandatFields(usuarioObject) ) {

        const cpf = usuarioObject["cpf"];
        const senha = usuarioObject["senha"];

        if ( cpf != null && cpf.trim().length == 11 ) {

          if ( cpf.replace(/[0-9]/g, "").length === 0 ) {

            if ( senha == null || ( senha != null && senha.trim().length >= 8 )) {
              buttonSalvar.disabled = true;
              buttonCancelar.disabled = true;

              const matButtons: MatButton[] = [buttonSalvar, buttonCancelar];
              const usuario = this.trimIfString(usuarioObject);
              usuario["ativo"] = this.usuario.ativo;
              const oldCpf = usuario["old_cpf"];

              if(this.popUpMode === 'edit') {

                this.facadeService.update("usuario", usuario, matButtons).subscribe((usuarioResp)=>{
                  if((oldCpf == this.usuarioLogado.cpf && oldCpf != usuario["cpf"]) || senha != null) {
                    this.facadeService.showMessage("usuario","Seu usuário foi atualizado, realize o login novamente com seu novo cpf/senha.");
                    this.loginPublisher.logout();
                  } else {
                    this.facadeService.showMessage("usuario","Usuário Atualizado!");
                    this.updateLogado();
                    this.showPopUp(null, this.eraseUsuario);
                  }

                }, (error => {
                  buttonSalvar.disabled = false;
                  buttonCancelar.disabled = false;
                }));

              } else {

                this.facadeService.create("usuario", usuario, matButtons).subscribe((usuario)=>{
                  this.facadeService.showMessage("usuario","Usuário Cadastrado!");
                  this.updateLogado();
                  this.showPopUp(null, this.eraseUsuario);
                },(error => {
                  buttonSalvar.disabled = false;
                  buttonCancelar.disabled = false;
                }));

              }
            } else
              this.facadeService.showMessage("usuario", "Sua senha deve possuir no mínimo de 8 dígitos!");

          } else
            this.facadeService.showMessage("usuario", "Seu cpf deve possuir apenas números!");

        } else
          this.facadeService.showMessage("usuario", "Seu cpf deve possuir 11 dígitos (apenas números)");

      } else
        this.facadeService.showMessage("usuario", "Preencha todos os campos!");

    } else
      this.facadeService.showMessage("usuario", "Você não Possui Privilégios!")
  }

  onlyNotBlankMandatFields(json: Object) : boolean {
    let result = true;

    for(let key in json) {
      if(json[key] === undefined || json[key] === null ||
        (typeof json[key] === 'string' && json[key].trim() === "")) {
          console.log(key,json[key])
          result = false;
          break;
      }
    };

    return result;
  }

  trimIfString(json :Object) : Object {
    let result = json;

    Object.keys(json).forEach(key => {
        result[key] = typeof json[key] === 'string' ? json[key].trim() : json[key]
    });

    return result;
  }

  eraseUser(): void {
    this.facadeService.delete("usuario",this.usuario).subscribe(()=>{
      this.facadeService.showMessage("usuario","Usuário Removido!");
      this.getUsuarios();
      this.showPopUp(null, this.eraseUsuario);
    });
  }

  openConfirm(): void {
    this.flagShowConfirm = true;
  }

  closeConfirm(): void {
    this.flagShowConfirm = false;
  }

  cancelCadastro():void{
    this.router.navigate(['login'])
  }

  search(input: HTMLInputElement) {
    const searchText = input.value;
    this.filterUsuario = this.usuarios.filter(usuario => {

      return Object.keys(usuario).filter(key => {
        if(key in ["is_professor", "ativo"] && usuario[key] != undefined) {
          const validText = usuario[key] && "sim".includes(searchText.toLowerCase()) ||
            !usuario[key] &&  "não".includes(searchText.toLowerCase()) ||
            !usuario[key] &&  "nao".includes(searchText.toLowerCase());

            return validText && this.filterField === key || validText && this.filterField === "";
        } else if(usuario[key] != undefined) {
          const validText = usuario[key].toString().toLowerCase().includes(searchText.toLowerCase());
          return validText && this.filterField === key || validText && this.filterField === "";
        } else {
          return false;
        }
      }).length > 0;

    });
  }

  clickPoUp(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.showPopUp(null, this.eraseUsuario);
    }
  }

  clickConfirm(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.closeConfirm();
    }
  }

}
