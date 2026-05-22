import pb from '@/lib/pocketbase/client'

export const getCompanyPayrollBatches = (companyId: string) =>
  pb
    .collection('payroll_batches')
    .getFullList({ filter: `company_id="${companyId}"`, sort: '-created' })

export const createPayrollBatch = (data: FormData) => pb.collection('payroll_batches').create(data)
