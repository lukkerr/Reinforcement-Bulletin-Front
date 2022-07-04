import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Cursa } from "../model/cursa";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment"
import { catchError } from "rxjs/operators";
import { of } from 'rxjs';
import { MatButton } from "@angular/material/button";

@Injectable({
  providedIn: 'root'
})

export class CursaService {

  baseUrl = `${environment.api}/cursas`;

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {
  }

  showMessage(msg: string):void{
    this.snackBar.open(msg,'X', {duration:3000, horizontalPosition:"right", verticalPosition:"top"})
  }

  create(cursa: Cursa, matButtons: MatButton[]): Observable<Cursa> {
    return this.http.post<Cursa>(this.baseUrl, cursa).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Cursa>();
    }));
  }

  update(cursa: Cursa, matButtons: MatButton[]): Observable<Cursa> {
    return this.http.put<Cursa>(`${this.baseUrl}/${cursa.id_cursa}`, cursa).pipe(catchError(e => {
      this.showMessage(e.error.error);
      matButtons.forEach(button => button.disabled = false);
      return of<Cursa>();
    }));
  }

  delete(cursa: Cursa): Observable<Cursa>{
    return this.http.delete<Cursa>(`${this.baseUrl}/${cursa.id_cursa}`).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Cursa>();
    }));
  }

  read():Observable<Cursa[]>{
    return this.http.get<Cursa[]>(this.baseUrl).pipe(catchError(e => {
      this.showMessage(e.error.error);
      return of<Cursa[]>();
    }));
  }

}
