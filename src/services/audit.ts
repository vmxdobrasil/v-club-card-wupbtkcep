import pb from '@/lib/pocketbase/client'

export const getBinLogs = async (companyId: string) => {
  return pb.collection('bin_logs').getFullList({
    filter: `company_id = "${companyId}"`,
    expand: 'changed_by,company_id',
    sort: '-created',
  })
}

export const getBinAuditLogs = async (companyId?: string) => {
  const filter = companyId ? `company_id = "${companyId}"` : ''
  return pb.collection('bin_logs').getFullList({
    filter,
    expand: 'changed_by,company_id',
    sort: '-created',
  })
}
