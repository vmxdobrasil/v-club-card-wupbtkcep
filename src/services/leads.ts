import pb from '@/lib/pocketbase/client'
import { Catalog } from './catalogs'

export interface Lead {
  id: string
  name?: string
  contact_info?: string
  catalog_id: string
  source?: string
  interaction_history?: any
  created: string
  updated: string
  expand?: {
    catalog_id?: Catalog
  }
}

export const getLeads = () =>
  pb.collection('leads').getFullList<Lead>({ expand: 'catalog_id', sort: '-created' })
export const getCompanyLeads = (companyId: string) =>
  pb.collection('leads').getFullList<Lead>({
    filter: `catalog_id.company_id = '${companyId}'`,
    expand: 'catalog_id',
    sort: '-created',
  })
export const createLead = (data: Partial<Lead>) => pb.collection('leads').create<Lead>(data)
export const updateLead = (id: string, data: Partial<Lead>) =>
  pb.collection('leads').update<Lead>(id, data)
export const deleteLead = (id: string) => pb.collection('leads').delete(id)
