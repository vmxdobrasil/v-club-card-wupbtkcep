import pb from '@/lib/pocketbase/client'

export const getCardHolders = () =>
  pb.collection('card_holders').getFullList({ expand: 'user_id,company_id' })
export const getMyCardHolder = (userId: string) =>
  pb.collection('card_holders').getFirstListItem(`user_id="${userId}"`)

export const getCompanyCardHolders = (companyId: string) =>
  pb
    .collection('card_holders')
    .getFullList({ filter: `company_id="${companyId}"`, expand: 'user_id,company_id' })

export const updateCardHolder = (id: string, data: any) =>
  pb.collection('card_holders').update(id, data)
