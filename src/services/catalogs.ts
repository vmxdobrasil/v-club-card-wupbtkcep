import pb from '@/lib/pocketbase/client'

export const getCatalogs = () =>
  pb.collection('catalogs').getFullList({ expand: 'company_id,products', sort: '-created' })

export const getCompanyCatalogs = (companyId: string) =>
  pb.collection('catalogs').getFullList({
    filter: `company_id = '${companyId}'`,
    expand: 'company_id,products',
    sort: '-created',
  })

export const getCatalog = (id: string) =>
  pb.collection('catalogs').getOne(id, { expand: 'company_id,products' })

export const createCatalog = (data: any) => pb.collection('catalogs').create(data)

export const updateCatalog = (id: string, data: any) => pb.collection('catalogs').update(id, data)

export const deleteCatalog = (id: string) => pb.collection('catalogs').delete(id)
