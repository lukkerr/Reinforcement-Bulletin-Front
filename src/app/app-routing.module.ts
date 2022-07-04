import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { UsuarioComponent } from './views/usuario/usuario.component';
import { AlunoComponent } from './views/aluno/aluno.component';
import { DisciplinaComponent } from './views/disciplina/disciplina.component';
import { CursaComponent } from './views/cursa/cursa.component';
import { PagamentoComponent } from './views/pagamento/pagamento.component';

const routes: Routes = [
  {
    path:"",
    component: HomeComponent
  },
  {
    path:"login",
    component: LoginComponent
  },
  {
    path:"usuario",
    component: UsuarioComponent
  },
  {
    path:"aluno",
    component: AlunoComponent
  },
  {
    path:"disciplina",
    component: DisciplinaComponent
  },
  {
    path:"cursa",
    component: CursaComponent
  },
  {
    path:"pagamento",
    component: PagamentoComponent
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
