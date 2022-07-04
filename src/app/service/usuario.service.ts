import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Usuario } from "../model/usuario";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment"
import { catchError } from "rxjs/operators";
import { of } from 'rxjs';
import { MatButton } from "@angular/material/button";

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {

  baseUrl = `${environment.api}/usuarios`;

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {
  }

  showMessage(msg: string):void{
    this.snackBar.open(msg,'X', {duration:3000, horizontalPosition:"right", verticalPosition:"top"})
  }

  create(usuario: Usuario, matButtons: MatButton[]): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Usuario>();
    }));
  }

  update(usuario: Usuario, matButtons: MatButton[]): Observable<Usuario> {
    const oldCpf = usuario["old_cpf"];
    delete usuario["old_cpf"];

    return this.http.put<Usuario>(`${this.baseUrl}/${oldCpf}`, usuario).pipe(catchError(e => {
      usuario["old_cpf"] = oldCpf;

      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Usuario>();
    }));
  }

  delete(usuario: Usuario): Observable<Usuario>{
    return this.http.delete<Usuario>(`${this.baseUrl}/${usuario.old_cpf}`).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Usuario>();
    }));
  }

  read():Observable<Usuario[]>{
    return this.http.get<Usuario[]>(this.baseUrl).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Usuario[]>();
    }));
  }

}
