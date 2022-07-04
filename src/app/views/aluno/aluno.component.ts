import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Usuario } from "../../model/usuario";
import { Aluno } from "../../model/aluno";
import { Router } from "@angular/router";
import { LoginPublisher } from "../../service/login-publisher.service";
import { FacadeService } from "../../service/facade.service";

@Component({
  selector: 'app-aluno',
  templateUrl: './aluno.component.html',
  styleUrls: ['./aluno.component.scss']
})
export class AlunoComponent implements OnInit {

  filterFields: string[] = ['Id', 'Responsável', 'Nome', 'Nascimento', 'Ativo'];
  filterField: string = '';
  filterAluno: Aluno[] = [];
  responsaveis: Usuario[] = [];
  alunos: Aluno[] = [];
  flagShowPopup = false;
  flagShowConfirm = false;
  displayedColumns: string[] = ['id_aluno', 'cpf_responsavel', 'nome_do_aluno', 'data_de_nascimento', 'ativo'];
  aluno: Aluno = null;
  eraseAluno: Aluno = {
    cpf_responsavel: '',
    nome_do_aluno: '',
    data_de_nascimento: this.dateDefault(),
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
    this.getAlunos();
    this.getResponsaveis();
    this.loaded = true;
  }

  showPopUp(mode: String, aluno: Aluno): void {
    if(this.usuarioLogado != null && this.usuarioLogado.is_professor) {
      this.flagShowPopup = !this.flagShowPopup;
      if(!this.flagShowPopup)
        this.flagShowConfirm = false;
  
      if(aluno == this.eraseAluno)
        this.changePassword = false;
  
      this.popUpMode = mode;
      this.aluno = <Aluno> JSON.parse( JSON.stringify(aluno) );  
    }
  }

  async getAlunos() {
    this.facadeService.read("aluno").subscribe((alunos: Aluno[]) => {
      
      if(this.usuarioLogado && !this.usuarioLogado.is_professor)
        alunos = alunos.filter(a => this.usuarioLogado.alunos.filter(a => a.id_aluno === a.id_aluno).length > 0);

      this.alunos = alunos;
      this.filterAluno = alunos;
      this.filterAluno = this.filterAluno.sort((a,b) => a.nome_do_aluno.localeCompare(b.nome_do_aluno));
    });
  }

  async getResponsaveis() {
    this.facadeService.read("usuario").subscribe((responsaveis: Usuario[]) => {
      this.responsaveis = responsaveis.filter(u => !u.is_professor);
    });
  }

  saveUser(buttonSalvar: MatButton, buttonCancelar: MatButton):void{
    if (this.usuarioLogado !== null && this.usuarioLogado.is_professor) {
      let alunoObject: Object = <Object> this.aluno;

      if( this.onlyNotBlankMandatFields(alunoObject) ) {

        buttonSalvar.disabled = true;
        buttonCancelar.disabled = true;

        const matButtons: MatButton[] = [buttonSalvar, buttonCancelar];
        const aluno = this.trimIfString(alunoObject);
        aluno["ativo"] = this.aluno.ativo;

        if(this.popUpMode === 'edit' && aluno["id_aluno"]) {
          this.facadeService.update("aluno", aluno, matButtons).subscribe((alunoResp)=>{
            this.facadeService.showMessage("aluno","Aluno Atualizado!");
            this.updateLogado();
            this.showPopUp(null, this.eraseAluno);
          }, (error => {
            buttonSalvar.disabled = false;
            buttonCancelar.disabled = false;
          }));

        } else {
          this.facadeService.create("aluno", aluno, matButtons).subscribe((aluno)=>{
            this.facadeService.showMessage("aluno","Aluno Cadastrado!");
            this.updateLogado();
            this.showPopUp(null, this.eraseAluno);
          },(error => {
            buttonSalvar.disabled = false;
            buttonCancelar.disabled = false;
          }));
        }

      } else
        this.facadeService.showMessage("aluno", "Preencha todos os campos!");

    } else
      this.facadeService.showMessage("aluno", "Você não Possui Privilégios!")
  }

  onlyNotBlankMandatFields(json: Object) : boolean {
    let result = true;

    for(let key in json) {
      if(json[key] === undefined || json[key] === null ||
        (typeof json[key] === 'string' && json[key].trim() === "")) {
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

  eraseStudent(): void {
    this.facadeService.delete("aluno",this.aluno).subscribe(()=>{
      this.facadeService.showMessage("aluno","Aluno Removido!");
      this.getAlunos();
      this.showPopUp(null, this.eraseAluno);
    });
  }

  dateDefault(): Date {
    const now = new Date();
    now.setFullYear( now.getFullYear() - 10 );
    return now;
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
    this.filterAluno = this.filterAluno.sort((a,b) => a.nome_do_aluno.localeCompare(b.nome_do_aluno));

    this.filterAluno = this.alunos.filter(aluno => {

      return Object.keys(aluno).filter(key => {
        if(key === "ativo" && aluno[key] != undefined) {
          const validText = aluno[key] && "sim".includes(searchText.toLowerCase()) ||
            !aluno[key] &&  "não".includes(searchText.toLowerCase()) ||
            !aluno[key] &&  "nao".includes(searchText.toLowerCase());

            return validText && this.filterField === key || validText && this.filterField === "";
        } else if(aluno[key] != undefined) {
          const validText = aluno[key].toString().toLowerCase().includes(searchText.toLowerCase());
          return validText && this.filterField === key || validText && this.filterField === "";
        } else {
          return false;
        }
      }).length > 0;

    });
  }

  clickPoUp(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.showPopUp(null, this.eraseAluno);
    }
  }

  clickConfirm(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.closeConfirm();
    }
  }

}
