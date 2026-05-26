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

export const getCompanyCatalogs = (companyId: string) => getCatalogs(companyId)

export const getCatalog = (id: string) =>
  pb.collection('catalogs').getOne<Catalog>(id, { expand: 'product_ids,company_id' })

export const getCatalogBySlug = async (slug: string) => {
  const result = await pb
    .collection('catalogs')
    .getFirstListItem<Catalog>(`slug = '${slug}'`, { expand: 'product_ids,company_id' })
  return result
}

export const getCatalogItems = async (catalogId: string) => {
  const catalog = await getCatalog(catalogId)
  return catalog.expand?.product_ids || []
}

export const createCatalogItem = async (catalogId: string, productId: string) => {
  const catalog = await getCatalog(catalogId)
  const products = catalog.product_ids || []
  if (!products.includes(productId)) {
    products.push(productId)
    await updateCatalog(catalogId, { product_ids: products })
  }
}

export const deleteCatalogItem = async (catalogId: string, productId: string) => {
  const catalog = await getCatalog(catalogId)
  const products = catalog.product_ids || []
  const updated = products.filter((id: string) => id !== productId)
  await updateCatalog(catalogId, { product_ids: updated })
}

export const createCatalog = (data: FormData | Partial<Catalog>) =>
  pb.collection('catalogs').create<Catalog>(data as any)

export const updateCatalog = (id: string, data: FormData | Partial<Catalog>) =>
  pb.collection('catalogs').update<Catalog>(id, data as any)

export const deleteCatalog = (id: string) => pb.collection('catalogs').delete(id)
