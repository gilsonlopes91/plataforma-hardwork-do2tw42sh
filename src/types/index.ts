export type Role = 'ADMIN' | 'USER'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  created?: string
  updated?: string
}

export type StatusEntrouContato = 'Sim' | 'Não' | 'Pendente'
export type StatusEstaConosco = 'Sim' | 'Não' | 'Talvez' | 'Pendente'

export interface Engineer {
  id: string
  numero: string
  numero_corrigido: string
  numero_formatado: string
  nome_salvo: string
  nome_publico: string
  nome_completo: string
  e_mail: string
  titulo_: string
  cidade: string
  inspetoria: string
  status_2026: string
  created?: string
  updated?: string
}

export interface UserSelection {
  id: string
  user_id: string
  engineer_id: string
  entrou_em_contato: StatusEntrouContato
  esta_conosco: StatusEstaConosco
  observacoes: string
  created: string
  updated: string
  expand?: {
    engineer_id?: Engineer
    user_id?: User
  }
}
