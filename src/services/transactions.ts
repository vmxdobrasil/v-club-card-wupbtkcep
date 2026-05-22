import pb from '@/lib/pocketbase/client'

export type Transaction = {
  id: string
  holder_id: string
  company_id: string
  partner_id?: string
  amount: number
  type: 'debit' | 'credit'
  status: 'pending' | 'approved' | 'rejected'
  split_data?: any
  gateway_ref?: string
  created: string
  updated: string
}

export const getTransactions = () =>
  pb.collection('transactions').getFullList<Transaction>({ sort: '-created' })
