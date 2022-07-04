import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Aluno } from "../model/aluno";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment"
import { catchError } from "rxjs/operators";
import { of } from 'rxjs';
import { MatButton } from "@angular/material/button";

@Injectable({
  providedIn: 'root'
})

export class AlunoService {

  baseUrl = `${environment.api}/alunos`;

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {
  }

  showMessage(msg: string):void{
    this.snackBar.open(msg,'X', {duration:3000, horizontalPosition:"right", verticalPosition:"top"})
  }

  create(aluno: Aluno, matButtons: MatButton[]): Observable<Aluno> {
    return this.http.post<Aluno>(this.baseUrl, aluno).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Aluno>();
    }));
  }

  update(aluno: Aluno, matButtons: MatButton[]): Observable<Aluno> {
    return this.http.put<Aluno>(`${this.baseUrl}/${aluno.id_aluno}`, aluno).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Aluno>();
    }));
  }

  delete(aluno: Aluno): Observable<Aluno>{
    return this.http.delete<Aluno>(`${this.baseUrl}/${aluno.id_aluno}`).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Aluno>();
    }));
  }

  read():Observable<Aluno[]>{
    return this.http.get<Aluno[]>(this.baseUrl).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Aluno[]>();
    }));
  }

}
