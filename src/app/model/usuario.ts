import { Aluno } from "./aluno"
import { Disciplina } from "./disciplina"

export interface Usuario {
  cpf: string
  old_cpf?: string
  nome: string
  senha?: string
  email: string
  telefone: string
  is_professor?: boolean
  ativo?: boolean
  alunos?: Aluno[]
  disciplinas?: Disciplina[]
}
