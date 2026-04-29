export type Role = 'ADMIN' | 'USER'

export interface User {
  id: string
  username: string
  name: string
  role: Role
}

export type Status = 'Sim' | 'Não' | 'Talvez' | 'Pendente'

export interface Engineer {
  id: string
  name: string
  crea: string
  phone: string
  role: string
  city: string
  state: string
  [key: string]: any
}

export interface ListEntry {
  id: string
  userId: string
  engineerId: string
  status: Status
  observation: string
  lastActionDate: string
}
