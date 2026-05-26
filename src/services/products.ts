import pb from '@/lib/pocketbase/client'

export const getProductsByCatalog = (catalogId: string) =>
  pb.collection('products').getFullList({ filter: `catalog_id="${catalogId}"`, sort: 'sort_order' })

export const createProduct = (data: any) => pb.collection('products').create(data)
export const updateProduct = (id: string, data: any) => pb.collection('products').update(id, data)
export const deleteProduct = (id: string) => pb.collection('products').delete(id)
