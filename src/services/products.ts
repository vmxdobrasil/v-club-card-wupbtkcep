import pb from '@/lib/pocketbase/client'
import { Company } from './companies'

export interface Product {
  id: string
  name: string
  description?: string
  price?: number
  image?: string
  company_id: string
  status: 'active' | 'inactive'
  created: string
  updated: string
  expand?: {
    company_id?: Company
  }
}

export const getProducts = () =>
  pb.collection('products').getFullList<Product>({ expand: 'company_id', sort: '-created' })
export const getCompanyProducts = (companyId: string) =>
  pb.collection('products').getFullList<Product>({
    filter: `company_id = '${companyId}'`,
    expand: 'company_id',
    sort: '-created',
  })
export const getProduct = (id: string) =>
  pb.collection('products').getOne<Product>(id, { expand: 'company_id' })
export const createProduct = (data: FormData | Partial<Product>) =>
  pb.collection('products').create<Product>(data)
export const updateProduct = (id: string, data: FormData | Partial<Product>) =>
  pb.collection('products').update<Product>(id, data)
export const deleteProduct = (id: string) => pb.collection('products').delete(id)
