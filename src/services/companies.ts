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
  cnpj?: string
  address?: string
  zip_code?: string
  phone?: string
  responsible_name?: string
}

export const getCompanies = async () => {
  return pb.collection<Company>('companies').getFullList({ sort: '-created' })
}

export const getCompany = async (id: string) => {
  return pb.collection<Company>('companies').getOne(id)
}

export const createCompany = async (data: Partial<Company>) => {
  return pb.collection<Company>('companies').create(data)
}

export const updateCompany = async (id: string, data: Partial<Company>) => {
  return pb.collection<Company>('companies').update(id, data)
}

export const deleteCompany = async (id: string) => {
  return pb.collection('companies').delete(id)
}
