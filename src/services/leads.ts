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
