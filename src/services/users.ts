import pb from '@/lib/pocketbase/client'

export type User = {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  created: string
  updated: string
}

export const getPartners = () =>
  pb.collection('users').getFullList<User>({ filter: "role='partner'", sort: '-created' })
