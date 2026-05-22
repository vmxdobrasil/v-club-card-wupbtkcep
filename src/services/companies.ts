import pb from '@/lib/pocketbase/client'

export const getCompanies = () => pb.collection('companies').getFullList({ sort: '-created' })
