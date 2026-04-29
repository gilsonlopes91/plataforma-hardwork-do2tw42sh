import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Engineer, ListEntry, Status } from '@/types'
import { toast } from 'sonner'

const MOCK_USERS: User[] = [
  { id: '1', username: 'eu', name: 'Mestre', role: 'ADMIN' },
  { id: '2', username: 'admin', name: 'Administrador', role: 'ADMIN' },
  { id: '3', username: 'teste', name: 'Usuário Padrão', role: 'USER' },
]

const MOCK_ENGINEERS: Engineer[] = [
  {
    id: 'e1',
    name: 'Roberto Almeida',
    crea: '12345/SP',
    phone: '(11) 98765-4321',
    role: 'Engenheiro Civil',
    city: 'São Paulo',
    state: 'SP',
  },
  {
    id: 'e2',
    name: 'Fernanda Costa',
    crea: '54321/RJ',
    phone: '(21) 99999-8888',
    role: 'Engenheiro Eletricista',
    city: 'Rio de Janeiro',
    state: 'RJ',
  },
  {
    id: 'e3',
    name: 'Carlos Eduardo',
    crea: '98765/MG',
    phone: '(41) 97777-6666',
    role: 'Engenheiro Mecânico',
    city: 'Curitiba',
    state: 'PR',
  },
  {
    id: 'e4',
    name: 'Ana Paula',
    crea: '11223/SC',
    phone: '(47) 96666-5555',
    role: 'Engenheiro Civil',
    city: 'Joinville',
    state: 'SC',
  },
  {
    id: 'e5',
    name: 'Julio Cesar',
    crea: '44556/RS',
    phone: '(48) 95555-4444',
    role: 'Engenheiro de Produção',
    city: 'Florianópolis',
    state: 'SC',
  },
  {
    id: 'e6',
    name: 'Mariana Silva',
    crea: '33445/BA',
    phone: '(71) 94444-3333',
    role: 'Engenheira Ambiental',
    city: 'Salvador',
    state: 'BA',
  },
]

interface AppContextType {
  currentUser: User | null
  users: User[]
  engineers: Engineer[]
  listEntries: ListEntry[]
  login: (username: string, pass: string) => User | null
  logout: () => void
  addToList: (engineerId: string) => void
  updateEntry: (entryId: string, status: Status, observation: string) => void
  removeEntry: (entryId: string) => void
  importEngineers: (newEngineers: Engineer[]) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hw_currentUser')
    return saved ? JSON.parse(saved) : null
  })

  const [users] = useState<User[]>(MOCK_USERS)

  const [engineers, setEngineers] = useState<Engineer[]>(() => {
    const saved = localStorage.getItem('hw_engineers')
    return saved ? JSON.parse(saved) : MOCK_ENGINEERS
  })

  const [listEntries, setListEntries] = useState<ListEntry[]>(() => {
    const saved = localStorage.getItem('hw_listEntries')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    if (currentUser) localStorage.setItem('hw_currentUser', JSON.stringify(currentUser))
    else localStorage.removeItem('hw_currentUser')
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem('hw_engineers', JSON.stringify(engineers))
  }, [engineers])

  useEffect(() => {
    localStorage.setItem('hw_listEntries', JSON.stringify(listEntries))
  }, [listEntries])

  const login = (username: string, pass: string) => {
    if (pass === '123456') {
      const user = users.find((u) => u.username === username)
      if (user) {
        setCurrentUser(user)
        return user
      }
    }
    return null
  }

  const logout = () => setCurrentUser(null)

  const addToList = (engineerId: string) => {
    if (!currentUser) return

    if (listEntries.some((e) => e.userId === currentUser.id && e.engineerId === engineerId)) {
      toast.error('Engenheiro já está na sua lista!')
      return
    }

    const newEntry: ListEntry = {
      id: `entry_${Date.now()}`,
      userId: currentUser.id,
      engineerId,
      status: 'Pendente',
      observation: '',
      lastActionDate: new Date().toISOString(),
    }

    setListEntries((prev) => [newEntry, ...prev])
    toast.success('Engenheiro adicionado à sua lista!')
  }

  const updateEntry = (entryId: string, status: Status, observation: string) => {
    setListEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, status, observation, lastActionDate: new Date().toISOString() }
          : entry,
      ),
    )
    toast.success('Registro atualizado com sucesso!')
  }

  const removeEntry = (entryId: string) => {
    setListEntries((prev) => prev.filter((e) => e.id !== entryId))
    toast.success('Engenheiro removido da lista.')
  }

  const importEngineers = (newEngineers: Engineer[]) => {
    setEngineers(newEngineers)
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        engineers,
        listEntries,
        login,
        logout,
        addToList,
        updateEntry,
        removeEntry,
        importEngineers,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
