import pb from '@/lib/pocketbase/client'

export const getProducts = () =>
  pb.collection('products').getFullList({ expand: 'partner_id', sort: '-created' })
export const getPartnerProducts = (partnerId: string) =>
  pb
    .collection('products')
    .getFullList({ filter: `partner_id = '${partnerId}'`, expand: 'partner_id', sort: '-created' })
export const createProduct = (data: FormData | any) => pb.collection('products').create(data)
export const updateProduct = (id: string, data: FormData | any) =>
  pb.collection('products').update(id, data)
export const deleteProduct = (id: string) => pb.collection('products').delete(id)

export const getCatalogs = (activeOnly = false) =>
  pb
    .collection('catalogs')
    .getFullList({ filter: activeOnly ? "status='active'" : '', sort: '-created' })
export const getCatalog = (id: string) => pb.collection('catalogs').getOne(id)
export const createCatalog = (data: FormData | any) => pb.collection('catalogs').create(data)
export const updateCatalog = (id: string, data: FormData | any) =>
  pb.collection('catalogs').update(id, data)
export const deleteCatalog = (id: string) => pb.collection('catalogs').delete(id)

export const getCatalogItems = (catalogId?: string) => {
  const filter = catalogId ? `catalog_id = "${catalogId}"` : ''
  return pb
    .collection('catalog_items')
    .getFullList({ filter, expand: 'product_id,product_id.partner_id,catalog_id' })
}
export const addProductToCatalog = (catalogId: string, productId: string) =>
  pb.collection('catalog_items').create({ catalog_id: catalogId, product_id: productId })
export const removeProductFromCatalog = (id: string) => pb.collection('catalog_items').delete(id)
