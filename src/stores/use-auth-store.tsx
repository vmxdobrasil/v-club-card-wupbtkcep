import React, { createContext, useContext, useState, ReactNode } from 'react'

type Role = 'guest' | 'master' | 'company' | 'partner' | 'holder'

interface User {
  role: Role
  name: string
  companyName?: string
}

interface AuthContextType {
  user: User
  login: (role: Role, name: string, companyName?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({ role: 'guest', name: '' })

  const login = (role: Role, name: string, companyName?: string) => {
    setUser({ role, name, companyName })
  }

  const logout = () => {
    setUser({ role: 'guest', name: '' })
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
