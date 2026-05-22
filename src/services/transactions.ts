import pb from '@/lib/pocketbase/client'

export const getTransactions = () =>
  pb
    .collection('transactions')
    .getFullList({ sort: '-created', expand: 'holder_id.user_id,company_id,partner_id' })
export const getMyTransactions = (holderId: string) =>
  pb
    .collection('transactions')
    .getFullList({ filter: `holder_id="${holderId}"`, sort: '-created', expand: 'partner_id' })
export const createTransaction = (data: any) => pb.collection('transactions').create(data)

export const getCompanyTransactions = (companyId: string, filterStr?: string) =>
  pb.collection('transactions').getFullList({
    filter: `company_id="${companyId}"${filterStr ? ` && (${filterStr})` : ''}`,
    sort: '-created',
    expand: 'holder_id.user_id,partner_id',
  })
