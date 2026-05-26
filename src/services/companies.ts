import pb from '@/lib/pocketbase/client'

export const getCompanies = () => pb.collection('companies').getFullList({ sort: 'name' })
export const getCompany = (id: string) => pb.collection('companies').getOne(id)
