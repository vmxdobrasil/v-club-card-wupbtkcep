import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface Company extends RecordModel {
  name: string
  logo?: string
  bin_prefix: string
  commission_rate: number
  modality: '1' | '2' | 'both'
  gateway_provider: 'Asaas' | 'Alternative' | 'None/Manual'
  status: 'active' | 'inactive'
  owner_id?: string
  asaas_wallet_id?: string
  deleted_at?: string
  cnpj?: string
  address?: string
  zip_code?: string
  phone?: string
  whatsapp?: string
  responsible_name?: string
}

export const getCompanies = async () => {
  return pb.collection<Company>('companies').getFullList({
    sort: '-created',
    filter: "deleted_at = ''",
  })
}

export const getBinLogs = async () => {
  try {
    return await pb
      .collection('bin_logs')
      .getFullList({ sort: '-created', expand: 'company_id,changed_by' })
  } catch {
    return []
  }
}

export const createCompany = async (data: FormData) => {
  return pb.collection<Company>('companies').create(data)
}

export const updateCompany = async (id: string, data: FormData) => {
  return pb.collection<Company>('companies').update(id, data)
}

export const softDeleteCompany = async (id: string) => {
  const data = new FormData()
  data.append('deleted_at', new Date().toISOString())
  data.append('status', 'inactive')
  return pb.collection<Company>('companies').update(id, data)
}
