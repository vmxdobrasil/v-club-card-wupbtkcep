import pb from '@/lib/pocketbase/client'

export const getCatalogs = (filter?: string) =>
  pb.collection('catalogs').getFullList({ filter, expand: 'company_id', sort: '-created' })

export const getCatalog = (id: string) =>
  pb.collection('catalogs').getOne(id, { expand: 'company_id' })

export const createCatalog = (data: any) => pb.collection('catalogs').create(data)

export const updateCatalog = (id: string, data: any) => pb.collection('catalogs').update(id, data)

export const deleteCatalog = (id: string) => pb.collection('catalogs').delete(id)
