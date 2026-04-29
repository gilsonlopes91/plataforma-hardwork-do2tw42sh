import pb from '@/lib/pocketbase/client'
import { Engineer, UserSelection, User } from '@/types'

export const getEngineers = () =>
  pb.collection('engineers').getFullList<Engineer>({ sort: 'nome_completo' })

export const createEngineer = (data: Partial<Engineer>) =>
  pb.collection('engineers').create<Engineer>(data)

export const getUserSelections = (userId?: string) => {
  const filter = userId ? `user_id = "${userId}"` : ''
  return pb.collection('user_selections').getFullList<UserSelection>({
    filter,
    expand: 'engineer_id,user_id',
    sort: '-updated',
  })
}

export const createUserSelection = (userId: string, engineerId: string) => {
  return pb.collection('user_selections').create<UserSelection>({
    user_id: userId,
    engineer_id: engineerId,
    entrou_em_contato: 'Pendente',
    esta_conosco: 'Pendente',
    observacoes: '',
  })
}

export const updateUserSelection = (id: string, data: Partial<UserSelection>) => {
  return pb.collection('user_selections').update<UserSelection>(id, data)
}

export const deleteUserSelection = (id: string) => {
  return pb.collection('user_selections').delete(id)
}

export const getUsers = () => pb.collection('users').getFullList<User>()
