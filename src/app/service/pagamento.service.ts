import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Pagamento } from "../model/pagamento";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment"
import { catchError } from "rxjs/operators";
import { of } from 'rxjs';
import { MatButton } from "@angular/material/button";

@Injectable({
  providedIn: 'root'
})

export class PagamentoService {

  baseUrl = `${environment.api}/pagamentos`;

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {
  }

  showMessage(msg: string):void{
    this.snackBar.open(msg,'X', {duration:3000, horizontalPosition:"right", verticalPosition:"top"})
  }

  create(pagamento: Pagamento, matButtons: MatButton[]): Observable<Pagamento> {
    return this.http.post<Pagamento>(this.baseUrl, pagamento).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Pagamento>();
    }));
  }

  update(pagamento: Pagamento, matButtons: MatButton[]): Observable<Pagamento> {
    return this.http.put<Pagamento>(`${this.baseUrl}/${pagamento.id_pagamento}`, pagamento).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Pagamento>();
    }));
  }

  delete(pagamento: Pagamento): Observable<Pagamento>{
    return this.http.delete<Pagamento>(`${this.baseUrl}/${pagamento.id_pagamento}`).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Pagamento>();
    }));
  }

  read():Observable<Pagamento[]>{
    return this.http.get<Pagamento[]>(this.baseUrl).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Pagamento[]>();
    }));
  }

}
