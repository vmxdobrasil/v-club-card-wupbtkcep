import pb from '@/lib/pocketbase/client'

export const getProducts = (catalogId: string) =>
  pb
    .collection('products')
    .getFullList({ filter: `catalog_id="${catalogId}"`, sort: 'order,created' })

export const createProduct = (data: FormData | any) => pb.collection('products').create(data)

export const updateProduct = (id: string, data: FormData | any) =>
  pb.collection('products').update(id, data)

export const deleteProduct = (id: string) => pb.collection('products').delete(id)

export const updateProductOrders = async (updates: { id: string; order: number }[]) => {
  for (const update of updates) {
    await pb.collection('products').update(update.id, { order: update.order })
  }
}
