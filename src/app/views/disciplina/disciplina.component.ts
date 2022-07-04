import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Usuario } from "../../model/usuario";
import { Disciplina } from "../../model/disciplina";
import { Router } from "@angular/router";
import { LoginPublisher } from "../../service/login-publisher.service";
import { FacadeService } from "../../service/facade.service";

@Component({
  selector: 'app-disciplina',
  templateUrl: './disciplina.component.html',
  styleUrls: ['./disciplina.component.scss']
})
export class DisciplinaComponent implements OnInit {

  filterFields: string[] = ['Id', 'Professor', 'Nome', 'Ativo'];
  filterField: string = '';
  filterDisciplina: Disciplina[] = [];
  professores: Usuario[] = [];
  disciplinas: Disciplina[] = [];
  flagShowPopup = false;
  flagShowConfirm = false;
  displayedColumns: string[] = ['id_disciplina', 'cpf_professor', 'nome_disciplina', 'ativo'];
  disciplina: Disciplina = null;
  eraseDisciplina: Disciplina = {
    cpf_professor: '',
    nome_disciplina: '',
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
    this.getDisciplinas();
    this.getProfessores();
    this.loaded = true;
  }

  showPopUp(mode: String, disciplina: Disciplina): void {
    this.flagShowPopup = !this.flagShowPopup;
    if(!this.flagShowPopup)
      this.flagShowConfirm = false;

    if(disciplina == this.eraseDisciplina)
      this.changePassword = false;

    this.popUpMode = mode;
    this.disciplina = <Disciplina> JSON.parse( JSON.stringify(disciplina) );
  }

  async getDisciplinas() {
    this.facadeService.read("disciplina").subscribe((disciplinas: Disciplina[]) => {
      this.disciplinas = disciplinas;
      this.filterDisciplina = disciplinas;
      this.filterDisciplina = this.filterDisciplina.sort((a,b) => a.nome_disciplina.localeCompare(b.nome_disciplina));
    });
  }

  async getProfessores() {
    this.facadeService.read("usuario").subscribe((professores: Usuario[]) => {
      this.professores = professores.filter(u => u.is_professor);
    });
  }

  saveUser(buttonSalvar: MatButton, buttonCancelar: MatButton):void{
    if (this.usuarioLogado !== null && this.usuarioLogado.is_professor) {
      let disciplinaObject: Object = <Object> this.disciplina;

      if( this.onlyNotBlankMandatFields(disciplinaObject) ) {

        buttonSalvar.disabled = true;
        buttonCancelar.disabled = true;

        const matButtons: MatButton[] = [buttonSalvar, buttonCancelar];
        const disciplina = this.trimIfString(disciplinaObject);
        disciplina["ativo"] = this.disciplina.ativo;

        if(this.popUpMode === 'edit' && disciplina["id_disciplina"]) {
          this.facadeService.update("disciplina", disciplina, matButtons).subscribe((disciplinaResp)=>{
            this.facadeService.showMessage("disciplina","Disciplina Atualizada!");
            this.updateLogado();
            this.showPopUp(null, this.eraseDisciplina);
          }, (error => {
            buttonSalvar.disabled = false;
            buttonCancelar.disabled = false;
          }));

        } else {
          this.facadeService.create("disciplina", disciplina, matButtons).subscribe((disciplina)=>{
            this.facadeService.showMessage("disciplina","Disciplina Cadastrada!");
            this.updateLogado();
            this.showPopUp(null, this.eraseDisciplina);
          },(error => {
            buttonSalvar.disabled = false;
            buttonCancelar.disabled = false;
          }));
        }

      } else
        this.facadeService.showMessage("disciplina", "Preencha todos os campos!");

    } else
      this.facadeService.showMessage("disciplina", "Você não Possui Privilégios!")
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

  eraseSubject(): void {
    this.facadeService.delete("disciplina",this.disciplina).subscribe(()=>{
      this.facadeService.showMessage("disciplina", "Disciplina Removida!");
      this.getDisciplinas();
      this.showPopUp(null, this.eraseDisciplina);
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
    this.filterDisciplina = this.filterDisciplina.sort((a,b) => a.nome_disciplina.localeCompare(b.nome_disciplina));

    this.filterDisciplina = this.disciplinas.filter(disciplina => {

      return Object.keys(disciplina).filter(key => {
        if(key === "ativo" && disciplina[key] != undefined) {
          const validText = disciplina[key] && "sim".includes(searchText.toLowerCase()) ||
            !disciplina[key] &&  "não".includes(searchText.toLowerCase()) ||
            !disciplina[key] &&  "nao".includes(searchText.toLowerCase());

            return validText && this.filterField === key || validText && this.filterField === "";
        } else if(disciplina[key] != undefined) {
          const validText = disciplina[key].toString().toLowerCase().includes(searchText.toLowerCase());
          return validText && this.filterField === key || validText && this.filterField === "";
        } else {
          return false;
        }
      }).length > 0;

    });
  }

  clickPoUp(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.showPopUp(null, this.eraseDisciplina);
    }
  }

  clickConfirm(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.closeConfirm();
    }
  }

}
