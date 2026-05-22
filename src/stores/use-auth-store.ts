import { create } from 'zustand'

export type Role = 'guest' | 'master' | 'company' | 'partner' | 'holder'

interface User {
  role: Role
  name: string
  companyName?: string
  email?: string
}

interface AuthState {
  role: Role
  user: User
  login: (role: Role, name: string, companyName?: string) => void
  logout: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  role: 'guest',
  user: { role: 'guest', name: '', companyName: '' },
  login: (role, name, companyName) =>
    set({
      role,
      user: { role, name, companyName, email: 'contato@vclub.com.br' },
    }),
  logout: () =>
    set({
      role: 'guest',
      user: { role: 'guest', name: '', companyName: '' },
    }),
}))

export default useAuthStore
