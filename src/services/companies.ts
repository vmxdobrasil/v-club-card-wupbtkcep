import pb from '@/lib/pocketbase/client'

export type Company = {
  id: string
  name: string
  logo?: string
  bin_prefix: string
  commission_rate: number
  modality: '1' | '2' | 'both'
  gateway_provider: 'Asaas' | 'Alternative' | 'None/Manual'
  status: 'active' | 'inactive'
  owner_id?: string
  created: string
  updated: string
}

export const getCompanies = () =>
  pb.collection('companies').getFullList<Company>({ sort: '-created' })

export const createCompany = (data: Partial<Company>) =>
  pb.collection('companies').create<Company>(data)

export const updateCompany = (id: string, data: Partial<Company>) =>
  pb.collection('companies').update<Company>(id, data)

export const deleteCompany = (id: string) => pb.collection('companies').delete(id)
