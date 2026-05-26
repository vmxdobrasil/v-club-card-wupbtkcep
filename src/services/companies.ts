import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Company extends RecordModel {
  name: string
  logo: string
  bin_prefix: string
  commission_rate: number
  modality: string
  gateway_provider: string
  status: string
  owner_id: string
  category: string
}

export const getCompanies = () =>
  pb.collection('companies').getFullList<Company>({ sort: '-created' })

export const getMyCompany = async () => {
  if (!pb.authStore.isValid || !pb.authStore.record) throw new Error('Not authenticated')
  return pb
    .collection('companies')
    .getFirstListItem<Company>(`owner_id = '${pb.authStore.record.id}'`)
}
