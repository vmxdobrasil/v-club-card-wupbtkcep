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

  cnpj: string
  address?: string
  zip_code?: string
  phone?: string
  whatsapp?: string
  is_matrix: boolean
  matrix_id?: string
  market_segment?: string
  co_manager_id?: string
  partner_id?: string
  change_log?: any

  expand?: {
    owner_id?: {
      id: string
      name: string
      email: string
    }
    matrix_id?: {
      id: string
      name: string
    }
  }
  created: string
  updated: string
}

export const getCompanies = () =>
  pb
    .collection('companies')
    .getFullList<Company>({ sort: '-created', expand: 'owner_id,matrix_id' })

export const createCompany = (data: Partial<Company>) =>
  pb.collection('companies').create<Company>(data)

export const updateCompany = (id: string, data: Partial<Company>) =>
  pb.collection('companies').update<Company>(id, data)

export const deleteCompany = (id: string) => pb.collection('companies').delete(id)
