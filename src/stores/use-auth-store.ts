import { create } from 'zustand'

export type Role = 'master' | 'company' | 'partner' | 'holder' | null

interface User {
  name: string
  email: string
}

interface AuthState {
  role: Role
  user: User | null
  login: (role: Role) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  user: null,
  login: (role) => {
    let name = 'Usuário'
    if (role === 'master') name = 'Administrador VMX'
    if (role === 'company') name = 'Gestor de RH'
    if (role === 'partner') name = 'Lojista Parceiro'
    if (role === 'holder') name = 'João Silva'
    set({ role, user: { name, email: 'contato@vclub.com.br' } })
  },
  logout: () => set({ role: null, user: null }),
}))
