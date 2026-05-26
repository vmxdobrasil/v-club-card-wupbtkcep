import pb from '@/lib/pocketbase/client'

export const getProducts = () =>
  pb.collection('products').getFullList({ expand: 'company_id', sort: '-created' })

export const getCompanyProducts = (companyId: string) =>
  pb
    .collection('products')
    .getFullList({ filter: `company_id = '${companyId}'`, expand: 'company_id', sort: '-created' })

export const createProduct = (data: FormData | any) => pb.collection('products').create(data)

export const updateProduct = (id: string, data: FormData | any) =>
  pb.collection('products').update(id, data)

export const deleteProduct = (id: string) => pb.collection('products').delete(id)
