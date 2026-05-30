import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getCompanies = async () => {
  return await pb.collection('companies').getFullList({
    sort: '-created',
  })
}

export const getCompany = async (id: string) => {
  return await pb.collection('companies').getOne(id)
}

export const createCompany = async (data: Record<string, any>) => {
  const formData = new FormData()

  Object.keys(data).forEach((key) => {
    const value = data[key]
    if (value !== undefined && value !== null) {
      if (key === 'logo' && value instanceof File) {
        formData.append('logo', value)
      } else if (key !== 'logo') {
        formData.append(key, String(value))
      }
    }
  })

  return await pb.collection('companies').create(formData)
}

export const updateCompany = async (id: string, data: Record<string, any>) => {
  const formData = new FormData()

  Object.keys(data).forEach((key) => {
    const value = data[key]
    if (value !== undefined && value !== null) {
      if (key === 'logo' && value instanceof File) {
        formData.append('logo', value)
      } else if (key === 'logo' && typeof value === 'string' && value === '') {
        // Lida com exclusão da logo se string vazia
        formData.append('logo', '')
      } else if (key !== 'logo') {
        formData.append(key, String(value))
      }
    }
  })

  return await pb.collection('companies').update(id, formData)
}

export const deleteCompany = async (id: string) => {
  return await pb.collection('companies').delete(id)
}

export const getLogoUrl = (record: RecordModel, filename: string) => {
  if (!filename) return ''
  return pb.files.getURL(record, filename)
}
