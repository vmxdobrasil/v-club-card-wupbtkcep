import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Catalog extends RecordModel {
  title: string
  description: string
  banner: string
  company_id: string
  product_ids: string[]
  status: 'active' | 'inactive'
  slug: string
}

export const getCatalogs = (companyId?: string) =>
  pb.collection('catalogs').getFullList<Catalog>({
    filter: companyId ? `company_id = '${companyId}'` : '',
    sort: '-created',
  })

export const getCatalog = (id: string) =>
  pb.collection('catalogs').getOne<Catalog>(id, { expand: 'product_ids,company_id' })

export const getCatalogBySlug = async (slug: string) => {
  const result = await pb
    .collection('catalogs')
    .getFirstListItem<Catalog>(`slug = '${slug}'`, { expand: 'product_ids,company_id' })
  return result
}

export const createCatalog = (data: FormData) => pb.collection('catalogs').create<Catalog>(data)

export const updateCatalog = (id: string, data: FormData) =>
  pb.collection('catalogs').update<Catalog>(id, data)

export const deleteCatalog = (id: string) => pb.collection('catalogs').delete(id)
