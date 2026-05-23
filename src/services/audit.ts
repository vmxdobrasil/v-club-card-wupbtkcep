import pb from '@/lib/pocketbase/client'

export const getCompanyLogs = (companyId: string) =>
  pb.collection('audit_logs').getFullList({
    filter: `collection_name="companies" && record_id="${companyId}"`,
    sort: '-created',
    expand: 'user_id',
  })

export const getBinLogs = (companyId: string) =>
  pb.collection('bin_history').getFullList({
    filter: `company_id="${companyId}"`,
    sort: '-created',
    expand: 'changed_by',
  })
