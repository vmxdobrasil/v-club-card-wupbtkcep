import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface PlatformSetting extends RecordModel {
  key: string
  value: string
}

export const getSettings = () =>
  pb.collection<PlatformSetting>('platform_settings').getFullList({ sort: '-created' })

export const getSettingByKey = (key: string) =>
  pb.collection<PlatformSetting>('platform_settings').getFirstListItem(`key="${key}"`)

export const createSetting = (data: { key: string; value: string }) =>
  pb.collection<PlatformSetting>('platform_settings').create(data)

export const updateSetting = (id: string, data: Partial<{ key: string; value: string }>) =>
  pb.collection<PlatformSetting>('platform_settings').update(id, data)

export const deleteSetting = (id: string) =>
  pb.collection<PlatformSetting>('platform_settings').delete(id)
