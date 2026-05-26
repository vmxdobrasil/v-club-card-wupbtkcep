import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Product extends RecordModel {
  name: string
  description: string
  price: number
  image: string
  category: string
  company_id: string
}

export const getProducts = (companyId?: string) =>
  pb.collection('products').getFullList<Product>({
    filter: companyId ? `company_id = '${companyId}'` : '',
    sort: '-created',
  })

export const getProduct = (id: string) => pb.collection('products').getOne<Product>(id)

export const createProduct = (data: FormData) => pb.collection('products').create<Product>(data)

export const updateProduct = (id: string, data: FormData) =>
  pb.collection('products').update<Product>(id, data)

export const deleteProduct = (id: string) => pb.collection('products').delete(id)
