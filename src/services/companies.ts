import pb from '@/lib/pocketbase/client'

export const getMyCompany = async (userId: string) => {
  try {
    return await pb.collection('companies').getFirstListItem(`owner_id="${userId}"`)
  } catch (e) {
    return null
  }
}

export const getCompanies = (filter?: string) =>
  pb.collection('companies').getFullList({ filter, sort: '-created' })

export const deleteCompany = (id: string) => pb.collection('companies').delete(id)

export const createCompany = (data: any) => pb.collection('companies').create(data)

export const updateCompany = (id: string, data: any) => pb.collection('companies').update(id, data)
