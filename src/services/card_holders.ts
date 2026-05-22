import pb from '@/lib/pocketbase/client'

export type CardHolder = {
  id: string
  user_id: string
  company_id: string
  card_number?: string
  cvv?: string
  expiry?: string
  total_limit: number
  used_limit: number
  max_consigned_margin?: number
  status: 'active' | 'blocked' | 'canceled'
  created: string
  updated: string
}

export const getCardHolders = () =>
  pb.collection('card_holders').getFullList<CardHolder>({ sort: '-created' })

export const getCompanyCardHolders = (companyId: string) =>
  pb
    .collection('card_holders')
    .getFullList<CardHolder>({ filter: `company_id = "${companyId}"`, sort: '-created' })

export const updateCardHolder = (id: string, data: Partial<CardHolder>) =>
  pb.collection('card_holders').update<CardHolder>(id, data)

export const getMyCardHolder = (userId?: string) => {
  const id = userId || pb.authStore.record?.id || ''
  return pb.collection('card_holders').getFirstListItem<CardHolder>(`user_id = "${id}"`)
}
