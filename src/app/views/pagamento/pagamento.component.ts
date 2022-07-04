import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Usuario } from "../../model/usuario";
import { Aluno } from "../../model/aluno";
import { Pagamento } from "../../model/pagamento";
import { Router } from "@angular/router";
import { LoginPublisher } from "../../service/login-publisher.service";
import { FacadeService } from "../../service/facade.service";

@Component({
  selector: 'app-pagamento',
  templateUrl: './pagamento.component.html',
  styleUrls: ['./pagamento.component.scss']
})
export class PagamentoComponent implements OnInit {

  filterFields: string[] = ['Id', 'Aluno', 'Vencimento', 'Valor', 'Pagamento', 'Via'];
  filterField: string = '';
  filterPagamento: Pagamento[] = [];
  alunos: Aluno[] = [];
  pagamentos: Pagamento[] = [];
  flagShowPopup = false;
  flagShowConfirm = false;
  displayedColumns: string[] = ['id_pagamento', 'id_aluno', 'data_vencimento', 'valor_mensalidade', 'data_pagamento', 'via_de_pagamento'];
  pagamento: Pagamento = null;
  erasePagamento: Pagamento = {
    id_aluno: null,
    data_vencimento: null,
    data_pagamento: null,
    valor_mensalidade: null,
    via_de_pagamento: null
  };
  usuarioLogado: Usuario = null;
  loaded: boolean = false;
  popUpMode = null;
  changePassword: boolean = false;
  pagamentosPendentes: boolean = true;

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
    this.getPagamentos();
    this.getAlunos();
    this.loaded = true;
  }

  showPopUp(mode: String, pagamento: Pagamento): void {
    if(this.usuarioLogado && this.usuarioLogado.is_professor) {
      this.flagShowPopup = !this.flagShowPopup;
      if(!this.flagShowPopup)
        this.flagShowConfirm = false;
  
      if(pagamento == this.erasePagamento)
        this.changePassword = false;
  
      this.popUpMode = mode;
      this.pagamento = <Pagamento> JSON.parse( JSON.stringify(pagamento) );  
    }
  }

  async getPagamentos() {
    this.facadeService.read("pagamento").subscribe((pagamentos: Pagamento[]) => {
      pagamentos = pagamentos.map(p => {
        p.old_data_pagamento = p.data_pagamento;
        p.old_via_de_pagamento = p.via_de_pagamento;
        return p;
      });

      if(this.usuarioLogado && !this.usuarioLogado.is_professor)
        pagamentos = pagamentos.filter(p => this.usuarioLogado.alunos.filter(a => a.id_aluno === p.id_aluno).length > 0);

      this.pagamentos = pagamentos;
      this.filterPagamento = JSON.parse( JSON.stringify(pagamentos) );
      if (this.pagamentosPendentes)
        this.filterPagamento = this.filterPagamento.filter(p => p.data_pagamento == null);

      this.filterPagamento = this.filterPagamento.sort((a,b) => a.id_pagamento - b.id_pagamento);
    });
  }

  async getAlunos() {
    this.facadeService.read("aluno").subscribe((alunos: Aluno[]) => {
      this.alunos = alunos;
    });
  }

  getNomeAluno(id: number): string {
    if (id) {
      const result = this.alunos.filter(a => a.id_aluno === id)[0];
      return result ? result.nome_do_aluno : '';  
    } else
      return '';
  }

  saveUser(buttonSalvar: MatButton, buttonCancelar: MatButton):void{
    if (this.usuarioLogado !== null && this.usuarioLogado.is_professor) {
      let pagamentoObject: Object = <Object> JSON.parse( JSON.stringify(this.pagamento) );

      delete pagamentoObject['old_data_pagamento'];
      delete pagamentoObject['old_via_de_pagamento'];

      if(pagamentoObject['data_pagamento'] === null || pagamentoObject['data_pagamento'] === undefined ||
        pagamentoObject['data_pagamento'].trim() === "")
          delete pagamentoObject['data_pagamento'];
      
      if(pagamentoObject['via_de_pagamento'] === null || pagamentoObject['via_de_pagamento'] === undefined ||
        pagamentoObject['via_de_pagamento'].trim() === "")
          delete pagamentoObject['via_de_pagamento'];

      if( this.onlyNotBlankMandatFields(pagamentoObject) ) {

        buttonSalvar.disabled = true;
        buttonCancelar.disabled = true;

        const matButtons: MatButton[] = [buttonSalvar, buttonCancelar];
        const pagamento = this.trimIfString(pagamentoObject);

        if(this.popUpMode === 'edit' && pagamento["id_pagamento"]) {

          if(pagamento["data_pagamento"] === undefined &&
            this.pagamento.old_data_pagamento !== this.pagamento.data_pagamento)
              pagamento["data_pagamento"] = null;          

          if(pagamento["via_de_pagamento"] === undefined &&
            this.pagamento.old_via_de_pagamento !== this.pagamento.via_de_pagamento)
              pagamento["via_de_pagamento"] = null;

          this.facadeService.update("pagamento", pagamento, matButtons).subscribe((pagamentoResp)=>{
            this.facadeService.showMessage("pagamento","Pagamento Atualizado!");
            this.updateLogado();
            this.showPopUp(null, this.erasePagamento);
          }, (error => {
            buttonSalvar.disabled = false;
            buttonCancelar.disabled = false;
          }));

        } else {
          this.facadeService.create("pagamento", pagamento, matButtons).subscribe((pagamento)=>{
            this.facadeService.showMessage("pagamento","Pagamento Cadastrado!");
            this.updateLogado();
            this.showPopUp(null, this.erasePagamento);
          },(error => {
            buttonSalvar.disabled = false;
            buttonCancelar.disabled = false;
          }));
        }

      } else
        this.facadeService.showMessage("pagamento", "Preencha todos os campos!");

    } else
      this.facadeService.showMessage("pagamento", "Você não Possui Privilégios!")
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

  erasePayment(): void {
    this.facadeService.delete("pagamento",this.pagamento).subscribe(()=>{
      this.facadeService.showMessage("pagamento","Pagamento Removido!");
      this.getPagamentos();
      this.showPopUp(null, this.erasePagamento);
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
    this.filterPagamento = this.filterPagamento.sort((a,b) => a.id_pagamento - b.id_pagamento);

    this.filterPagamento = this.pagamentos.filter(pagamento => {

      return Object.keys(pagamento).filter(key => {
        if(this.pagamentosPendentes && pagamento.data_pagamento)
          return false;

        if(key === "ativo" && pagamento[key] != undefined) {
          const validText = pagamento[key] && "sim".includes(searchText.toLowerCase()) ||
            !pagamento[key] &&  "não".includes(searchText.toLowerCase()) ||
            !pagamento[key] &&  "nao".includes(searchText.toLowerCase());

            return validText && this.filterField === key || validText && this.filterField === "";
        } else if(pagamento[key] != undefined) {
          const validText = pagamento[key].toString().toLowerCase().includes(searchText.toLowerCase());
          return validText && this.filterField === key || validText && this.filterField === "";
        } else {
          return false;
        }
      }).length > 0;

    });
  }

  clickPoUp(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.showPopUp(null, this.erasePagamento);
    }
  }

  clickConfirm(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.closeConfirm();
    }
  }

}