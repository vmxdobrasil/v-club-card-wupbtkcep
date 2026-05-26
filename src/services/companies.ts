import pb from '@/lib/pocketbase/client'

export const getMyCompany = async (userId: string) => {
  try {
    return await pb.collection('companies').getFirstListItem(`owner_id="${userId}"`)
  } catch (e) {
    return null
  }
}
