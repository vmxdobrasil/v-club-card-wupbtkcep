import pb from '@/lib/pocketbase/client'
import { Company } from './companies'
import { Product } from './products'

export interface Catalog {
  id: string
  name: string
  company_id: string
  slug: string
  is_promotional: boolean
  status: 'active' | 'inactive'
  created: string
  updated: string
  expand?: {
    company_id?: Company
  }
}

export interface CatalogItem {
  id: string
  product_id: string
  catalog_id: string
  created: string
  updated: string
  expand?: {
    product_id?: Product
    catalog_id?: Catalog
  }
}

export const getCatalogs = () =>
  pb.collection('catalogs').getFullList<Catalog>({ expand: 'company_id', sort: '-created' })
export const getCompanyCatalogs = (companyId: string) =>
  pb.collection('catalogs').getFullList<Catalog>({
    filter: `company_id = '${companyId}'`,
    expand: 'company_id',
    sort: '-created',
  })
export const getCatalog = (id: string) =>
  pb.collection('catalogs').getOne<Catalog>(id, { expand: 'company_id' })
export const getCatalogBySlug = async (slug: string) => {
  return pb
    .collection('catalogs')
    .getFirstListItem<Catalog>(`slug = '${slug}'`, { expand: 'company_id' })
}
export const createCatalog = (data: Partial<Catalog>) =>
  pb.collection('catalogs').create<Catalog>(data)
export const updateCatalog = (id: string, data: Partial<Catalog>) =>
  pb.collection('catalogs').update<Catalog>(id, data)
export const deleteCatalog = (id: string) => pb.collection('catalogs').delete(id)

export const getCatalogItems = (catalogId: string) =>
  pb.collection('catalog_items').getFullList<CatalogItem>({
    filter: `catalog_id = '${catalogId}'`,
    expand: 'product_id,catalog_id',
    sort: '-created',
  })
export const createCatalogItem = (data: Partial<CatalogItem>) =>
  pb.collection('catalog_items').create<CatalogItem>(data)
export const deleteCatalogItem = (id: string) => pb.collection('catalog_items').delete(id)
