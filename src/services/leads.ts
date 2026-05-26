import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Lead extends RecordModel {
  name: string
  contact: string
  notes: any
  company_id: string
  catalog_id: string
}

export const createLead = (data: {
  name: string
  contact: string
  notes?: any
  company_id: string
  catalog_id: string
}) => pb.collection('leads').create<Lead>(data)

export const getCompanyLeads = (companyId: string) =>
  pb.collection('leads').getFullList<Lead>({
    filter: `company_id = '${companyId}'`,
    sort: '-created',
  })
