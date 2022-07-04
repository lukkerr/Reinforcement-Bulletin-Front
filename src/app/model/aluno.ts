export interface Aluno {
    id_aluno?: number
    cpf_responsavel: string
    nome_do_aluno: string
    data_de_nascimento: Date
    ativo?: boolean
}