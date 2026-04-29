import React, { createContext, useContext, useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { User } from '@/types'

interface AppContextType {
  currentUser: User | null
  login: (email: string, pass: string) => Promise<User | null>
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(
    pb.authStore.record as unknown as User | null,
  )

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setCurrentUser(record as unknown as User | null)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, pass: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, pass)
      return authData.record as unknown as User
    } catch (e) {
      return null
    }
  }

  const logout = () => {
    pb.authStore.clear()
  }

  return (
    <AppContext.Provider value={{ currentUser, login, logout }}>{children}</AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
