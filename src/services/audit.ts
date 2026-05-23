import pb from '@/lib/pocketbase/client'

export const getBinAuditLogs = (companyId?: string) => {
  const filter = companyId ? `company_id = "${companyId}"` : ''
  return pb
    .collection('bin_prefix_history')
    .getFullList({ filter, expand: 'company_id,changed_by', sort: '-created' })
}

export const getBinLogs = (companyId: string) => {
  return pb.collection('bin_prefix_history').getFullList({
    filter: `company_id = "${companyId}"`,
    expand: 'changed_by',
    sort: '-created',
  })
}
