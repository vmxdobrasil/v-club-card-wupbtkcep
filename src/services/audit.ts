import pb from '@/lib/pocketbase/client'

export const getCompanyLogs = (companyId: string) =>
  pb.collection('audit_logs').getFullList({
    filter: `collection_name="companies" && record_id="${companyId}"`,
    sort: '-created',
    expand: 'user_id',
  })

export const getBinAuditLogs = (companyId?: string) => {
  const filter = companyId ? `company_id="${companyId}"` : ''
  return pb.collection('bin_audit_logs').getFullList({
    filter,
    sort: '-created',
    expand: 'company_id,changed_by',
  })
}

export const getBinLogs = getBinAuditLogs
