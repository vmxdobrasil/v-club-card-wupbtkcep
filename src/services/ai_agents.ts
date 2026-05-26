import pb from '@/lib/pocketbase/client'

export const getAIAgentByCompany = async (companyId: string) => {
  try {
    return await pb.collection('ai_agents').getFirstListItem(`company_id="${companyId}"`)
  } catch (e) {
    return null
  }
}

export const createAIAgent = (data: any) => pb.collection('ai_agents').create(data)

export const updateAIAgent = (id: string, data: any) => pb.collection('ai_agents').update(id, data)
