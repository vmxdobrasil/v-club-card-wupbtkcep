import pb from '@/lib/pocketbase/client'

export const getCompanies = () => pb.collection('companies').getFullList({ sort: 'name' })
export const getCompany = (id: string) => pb.collection('companies').getOne(id)
export const createCompany = (data: any) => pb.collection('companies').create(data)
export const updateCompany = (id: string, data: any) => pb.collection('companies').update(id, data)
export const deleteCompany = (id: string) => pb.collection('companies').delete(id)
