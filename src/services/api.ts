import pb from '@/lib/pocketbase/client'
import { Engineer, UserSelection, User } from '@/types'

export const getEngineers = (query: string = '') => {
  const filter = query ? `nome_completo ~ "${query}" || cidade ~ "${query}"` : ''
  return pb.collection('engineers').getList<Engineer>(1, 100, {
    filter,
    sort: 'nome_completo',
  })
}

export const getEngineersCount = () =>
  pb
    .collection('engineers')
    .getList(1, 1)
    .then((res) => res.totalItems)

export const searchEngineersByName = (name: string) => {
  return pb
    .collection('engineers')
    .getList<Engineer>(1, 20, {
      filter: name ? `nome_completo ~ "${name}"` : '',
      sort: 'nome_completo',
    })
    .then((res) => res.items)
}

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

export const getUsers = () => pb.collection('users').getFullList<User>({ sort: '-created' })

export const createUserRecord = async (name: string, email: string) => {
  const password = Math.random().toString(36).slice(-12) + 'A@1'
  const user = await pb.collection('users').create<User>({
    name,
    email,
    password,
    passwordConfirm: password,
    role: 'USER',
  })
  return user
}

export const updateUserRole = (id: string, role: 'ADMIN' | 'USER') => {
  return pb.collection('users').update<User>(id, { role })
}
