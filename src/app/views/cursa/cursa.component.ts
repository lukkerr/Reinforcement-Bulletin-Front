import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Usuario } from "../../model/usuario";
import { Disciplina } from "../../model/disciplina";
import { Aluno } from "../../model/aluno";
import { Cursa } from "../../model/cursa";
import { Router } from "@angular/router";
import { LoginPublisher } from "../../service/login-publisher.service";
import { FacadeService } from "../../service/facade.service";

@Component({
  selector: 'app-cursa',
  templateUrl: './cursa.component.html',
  styleUrls: ['./cursa.component.scss']
})
export class CursaComponent implements OnInit {

  filterFields: string[] = ['Id', 'Aluno', 'Nota 1', 'Nota 2', 'Nota 3', 'Média', 'Status'];
  dicionarioStatus: string[] = ["Em andamento", "Aprovado", "Reprovado", "Transferido" ];
  filterField: string = '';
  filterCursa: Cursa[] = [];
  disciplinas: Disciplina[] = [];
  alunos: Aluno[] = [];
  cursas: Cursa[] = [];
  flagShowPopup = false;
  flagShowConfirm = false;
  displayedColumns: string[] = ['id_disciplina', 'id_aluno', 'nota1', 'nota2', 'nota3', 'media', 'status'];
  cursa: Cursa = null;
  eraseCursa: Cursa = {
    id_disciplina: null,
    id_aluno: null,
    nota1: null,
    nota2: null,
    nota3: null,
    status: 0
  };
  usuarioLogado: Usuario = null;
  loaded: boolean = false;
  popUpMode = null;
  changePassword: boolean = false;
  minhasDisciplinas: boolean = true;
  disciplinasAtivas: boolean = false;

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
    await this.getDisciplinas();
    await this.getAlunos();
    await this.getCursas();

    if(!this.usuarioLogado.is_professor)
      this.minhasDisciplinas = false;

    this.loaded = true;
  }

  showPopUp(mode: String, cursa: Cursa): void {
    if(this.usuarioLogado != null && this.usuarioLogado.is_professor) {
      this.flagShowPopup = !this.flagShowPopup;
      if(!this.flagShowPopup)
        this.flagShowConfirm = false;
  
      if(cursa == this.eraseCursa)
        this.changePassword = false;
  
      this.popUpMode = mode;
      this.cursa = <Cursa> JSON.parse( JSON.stringify(cursa) );  
    }
  }

  async getCursas() {
    this.facadeService.read("cursa").subscribe((cursas: Cursa[]) => {
      cursas = cursas.map(c => {
        c.media = this.calculaMedia(c);
        c.old_nota1 = c.nota1;
        c.old_nota2 = c.nota2;
        c.old_nota3 = c.nota3;
        return c;
      })

      if(this.usuarioLogado && !this.usuarioLogado.is_professor)
        cursas = cursas.filter(c => this.usuarioLogado.alunos.filter(a => a.id_aluno === c.id_aluno).length > 0);

      this.cursas = cursas;
      
      if(this.minhasDisciplinas)
        this.filterCursa = this.cursas.filter(c =>
          this.usuarioLogado.disciplinas.filter(d =>
            d.id_disciplina === c.id_disciplina).length > 0);
      else
        this.filterCursa = cursas;

      this.filterCursa = this.filterCursa.sort((a,b) => a.id_cursa - b.id_cursa);
    });
  }
  
  calculaMedia(cursa: Cursa): number {
    if(cursa.nota1 == null || cursa.nota2 == null || cursa.nota3 == null)
      return null;
    
      return (cursa.nota1 + cursa.nota2 + cursa.nota3) / 3;
  }

  async getDisciplinas() {
    this.facadeService.read("disciplina").subscribe((disciplinas: Disciplina[]) => {
      this.disciplinas = disciplinas;
    });
  }

  getDisciplinasAtivas() : Disciplina[] {
    return this.disciplinas.filter(d => d.ativo);
  }

  async getAlunos() {
    this.facadeService.read("aluno").subscribe((alunos: Aluno[]) => {
      this.alunos = alunos.filter(a => a.ativo);
    });
  }

  saveUser(buttonSalvar: MatButton, buttonCancelar: MatButton):void{
    if (this.usuarioLogado !== null && this.usuarioLogado.is_professor) {
      let cursaObject: Object = <Object> JSON.parse( JSON.stringify(this.cursa) );

      delete cursaObject["media"];
      delete cursaObject["old_nota1"];
      delete cursaObject["old_nota2"];
      delete cursaObject["old_nota3"];

      if(cursaObject["nota1"] === null || cursaObject["nota1"] === undefined)
        delete cursaObject["nota1"];

      if(cursaObject["nota2"] === null || cursaObject["nota2"] === undefined)
        delete cursaObject["nota2"];

      if(cursaObject["nota3"] === null || cursaObject["nota3"] === undefined)
        delete cursaObject["nota3"];


      if( this.onlyNotBlankMandatFields(cursaObject) ) {

        buttonSalvar.disabled = true;
        buttonCancelar.disabled = true;

        const matButtons: MatButton[] = [buttonSalvar, buttonCancelar];
        const cursa = this.trimIfString(cursaObject);

        if(this.popUpMode === 'edit' && cursa["id_cursa"]) {
          
          if(cursa["nota1"] === undefined && this.cursa.old_nota1 !== this.cursa.nota1)
            cursa["nota1"] = null;          

          if(cursa["nota2"] === undefined && this.cursa.old_nota2 !== this.cursa.nota2)
            cursa["nota2"] = null;

          if(cursa["nota3"] === undefined && this.cursa.old_nota3 !== this.cursa.nota3)
            cursa["nota3"] = null;

          this.facadeService.update("cursa", cursa, matButtons).subscribe((cursaResp)=>{
            this.facadeService.showMessage("cursa","Cursa Atualizada!");
            this.updateLogado();
            this.showPopUp(null, this.eraseCursa);
          }, (error => {
            buttonSalvar.disabled = false;
            buttonCancelar.disabled = false;
          }));

        } else {
          this.facadeService.create("cursa", cursa, matButtons).subscribe((cursa)=>{
            this.facadeService.showMessage("cursa","Cursa Cadastrada!");
            this.updateLogado();
            this.showPopUp(null, this.eraseCursa);
          },(error => {
            buttonSalvar.disabled = false;
            buttonCancelar.disabled = false;
          }));
        }

      } else
        this.facadeService.showMessage("cursa", "Preencha todos os campos!");

    } else
      this.facadeService.showMessage("cursa", "Você não Possui Privilégios!")
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

  getNomeDisciplina(id: number): string {
    if(id) {
      const result : Disciplina = this.disciplinas.filter(d => d.id_disciplina === id)[0];
      return result ? result.nome_disciplina : '';
    } else
      return '';
  }

  getNomeAluno(id: number): string {
    if (id) {
      const result = this.alunos.filter(a => a.id_aluno === id)[0];
      return result ? result.nome_do_aluno : '';  
    } else
      return '';
  }

  eraseAttends(): void {
    this.facadeService.delete("cursa",this.cursa).subscribe(()=>{
      this.facadeService.showMessage("cursa", "Cursa Removida!");
      this.getCursas();
      this.showPopUp(null, this.eraseCursa);
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
    this.filterCursa = this.filterCursa.sort((a,b) => a.id_cursa - b.id_cursa);
    this.filterCursa = this.cursas.filter(cursa => {

      return Object.keys(cursa).filter(key => {
        if(this.minhasDisciplinas &&
          this.usuarioLogado.disciplinas.filter(d => d.id_disciplina === cursa.id_disciplina).length < 1)
            return false;

        if(this.disciplinasAtivas && this.getDisciplinasAtivas().filter(d => d.id_disciplina === cursa.id_disciplina).length < 1)
          return false;
                
        if(key === "status" && cursa[key] != undefined) {
          const dicionario: string = this.dicionarioStatus.map(d => d.toLowerCase())[cursa[key]];
          const validText = cursa[key] !== undefined && dicionario.includes(searchText.toLowerCase());

            return validText && this.filterField === key || this.filterField === "";
        } else if (['nota1', 'nota2', 'nota3', 'media'].includes(key)) {
          const value = cursa[key] !== null && cursa[key] !== undefined ? cursa[key] : '-';
          const validText = value.toString().toLowerCase().includes(searchText.toLowerCase());
          return validText && this.filterField === key || validText && this.filterField === "";
        } else if(cursa[key] != undefined) {
          const validText = cursa[key].toString().toLowerCase().includes(searchText.toLowerCase());
          return validText && this.filterField === key || validText && this.filterField === "";
        } else {
          return false;
        }
      }).length > 0;

    });
  }

  clickPoUp(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.showPopUp(null, this.eraseCursa);
    }
  }

  clickConfirm(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.closeConfirm();
    }
  }

}
