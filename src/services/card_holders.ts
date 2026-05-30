import pb from '@/lib/pocketbase/client'

export interface CardHolderData {
  name: string
  email?: string
  cpf: string
  address?: string
  cep?: string
  whatsapp?: string
  card_type: string
  credit_source: string
  total_limit: number
  company_id: string
  parent_holder_id?: string
  avatar?: File
}

export const getCardHolders = () => {
  return pb.collection('card_holders').getFullList({
    expand: 'user_id,company_id,parent_holder_id,parent_holder_id.user_id',
    sort: '-created',
  })
}

export const getCompanies = () => {
  return pb.collection('companies').getFullList({ sort: 'name' })
}

export const createCardHolder = async (data: CardHolderData) => {
  const cleanCpf = data.cpf.replace(/\D/g, '')
  const email = data.email || `holder-${cleanCpf}@vclub.local`
  const password = cleanCpf

  // 1. Create Auth User
  const userFormData = new FormData()
  userFormData.append('email', email)
  userFormData.append('password', password)
  userFormData.append('passwordConfirm', password)
  userFormData.append('name', data.name)
  userFormData.append('role', 'holder')

  if (data.avatar) {
    userFormData.append('avatar', data.avatar)
  }

  const user = await pb.collection('users').create(userFormData)

  // 2. Create Card Holder
  const holderData = {
    user_id: user.id,
    company_id: data.company_id,
    total_limit: data.total_limit,
    used_limit: 0,
    status: 'active',
    cpf: data.cpf,
    address: data.address,
    cep: data.cep,
    whatsapp: data.whatsapp,
    card_type: data.card_type,
    credit_source: data.credit_source,
    parent_holder_id: data.parent_holder_id || null,
  }

  try {
    const holder = await pb.collection('card_holders').create(holderData)
    return holder
  } catch (error) {
    // Rollback user creation if holder creation fails
    await pb
      .collection('users')
      .delete(user.id)
      .catch(() => {})
    throw error
  }
}
