import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MatButton } from "@angular/material/button";
import { UsuarioService } from "./usuario.service";
import { AlunoService } from "./aluno.service";
import { DisciplinaService } from "./disciplina.service";
import { CursaService } from "./cursa.service";
import { PagamentoService } from "./pagamento.service";

@Injectable({
  providedIn:'root'
})

export class FacadeService {

  constructor(private usuarioService: UsuarioService, private alunoService: AlunoService, private disciplinaService: DisciplinaService, private cursaService: CursaService, private pagamentoService: PagamentoService) {}

  private services = {
    "usuario": this.usuarioService,
    "aluno": this.alunoService,
    "disciplina": this.disciplinaService,
    "cursa": this.cursaService,
    "pagamento": this.pagamentoService,
  }

  create(tipo: string, newObject: any, matButtons: MatButton[]): Observable<any> {
    return this.services[tipo].create(newObject, matButtons);
  };

  update(tipo: string, newObject: any, matButtons: MatButton[]): Observable<any> {
    return this.services[tipo].update(newObject, matButtons);
  };

  delete(tipo: string, newObject: any): Observable<any> {
    return this.services[tipo].delete(newObject);
  };

  read(tipo: string):Observable<any[]> {
    return this.services[tipo].read();
  }

  showMessage(tipo: string, message: string): Observable<any> {
    return this.services[tipo].showMessage(message);
  }
}
