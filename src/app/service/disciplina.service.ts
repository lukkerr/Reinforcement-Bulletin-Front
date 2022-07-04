import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Disciplina } from "../model/disciplina";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment"
import { catchError } from "rxjs/operators";
import { of } from 'rxjs';
import { MatButton } from "@angular/material/button";

@Injectable({
  providedIn: 'root'
})

export class DisciplinaService {

  baseUrl = `${environment.api}/disciplinas`;

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {
  }

  showMessage(msg: string):void{
    this.snackBar.open(msg,'X', {duration:3000, horizontalPosition:"right", verticalPosition:"top"})
  }

  create(disciplina: Disciplina, matButtons: MatButton[]): Observable<Disciplina> {
    return this.http.post<Disciplina>(this.baseUrl, disciplina).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Disciplina>();
    }));
  }

  update(disciplina: Disciplina, matButtons: MatButton[]): Observable<Disciplina> {
    return this.http.put<Disciplina>(`${this.baseUrl}/${disciplina.id_disciplina}`, disciplina).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Disciplina>();
    }));
  }

  delete(disciplina: Disciplina): Observable<Disciplina>{
    return this.http.delete<Disciplina>(`${this.baseUrl}/${disciplina.id_disciplina}`).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Disciplina>();
    }));
  }

  read():Observable<Disciplina[]>{
    return this.http.get<Disciplina[]>(this.baseUrl).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Disciplina[]>();
    }));
  }

}
