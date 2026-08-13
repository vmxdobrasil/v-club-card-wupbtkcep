import pb from '@/lib/pocketbase/client'

export interface AsaasConfig {
  id?: string
  api_key: string
  environment: 'sandbox' | 'production'
  status: 'active' | 'inactive' | 'testing' | 'error'
  created?: string
  updated?: string
}

export interface CreateAsaasChargeParams {
  customer_name: string
  customer_cpf_cnpj?: string
  customer_email?: string
  amount: number
  due_date?: string
  billing_type: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED'
  description?: string
  company_id?: string
  holder_id?: string
}

export async function getAsaasConfig(): Promise<AsaasConfig | null> {
  try {
    const list = await pb.collection('asaas_config').getFullList({
      sort: '-created',
    })
    if (list.length > 0) {
      return list[0] as unknown as AsaasConfig
    }
  } catch (err) {
    console.error('Error fetching asaas_config:', err)
  }

  // Fallback to platform_settings if asaas_config is empty
  try {
    const settings = await pb.collection('platform_settings').getFullList()
    const apiKey = settings.find((s) => s.key === 'ASAAS_API_KEY')?.value || ''
    const env =
      (settings.find((s) => s.key === 'ASAAS_ENV')?.value as 'sandbox' | 'production') || 'sandbox'
    if (apiKey) {
      return {
        api_key: apiKey,
        environment: env,
        status: 'active',
      }
    }
  } catch (err) {
    console.error('Error fetching platform_settings fallback:', err)
  }

  return null
}

export async function saveAsaasConfig(data: {
  api_key: string
  environment: 'sandbox' | 'production'
  status?: 'active' | 'inactive' | 'testing' | 'error'
}): Promise<AsaasConfig> {
  const existing = await getAsaasConfig()
  const payload = {
    api_key: data.api_key,
    environment: data.environment,
    status: data.status || 'active',
  }

  // Update platform_settings too for sync with legacy services
  try {
    const settings = await pb.collection('platform_settings').getFullList()
    const keyRec = settings.find((s) => s.key === 'ASAAS_API_KEY')
    const envRec = settings.find((s) => s.key === 'ASAAS_ENV')

    if (keyRec) {
      await pb.collection('platform_settings').update(keyRec.id, { value: data.api_key })
    } else {
      await pb.collection('platform_settings').create({ key: 'ASAAS_API_KEY', value: data.api_key })
    }

    if (envRec) {
      await pb.collection('platform_settings').update(envRec.id, { value: data.environment })
    } else {
      await pb.collection('platform_settings').create({ key: 'ASAAS_ENV', value: data.environment })
    }
  } catch (e) {
    console.warn('Could not sync platform_settings:', e)
  }

  if (existing?.id) {
    const updated = await pb.collection('asaas_config').update(existing.id, payload)
    return updated as unknown as AsaasConfig
  } else {
    const created = await pb.collection('asaas_config').create(payload)
    return created as unknown as AsaasConfig
  }
}

export async function testAsaasConnection(
  apiKey: string,
  environment: 'sandbox' | 'production',
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const res = await fetch(`${pb.baseUrl}/backend/v1/asaas/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token ? `Bearer ${pb.authStore.token}` : '',
      },
      body: JSON.stringify({ api_key: apiKey, environment }),
    })
    const json = await res.json()
    if (!res.ok) {
      return { success: false, message: json.error || 'Erro na requisição' }
    }
    return json
  } catch (err: any) {
    return { success: false, message: err.message || 'Erro ao comunicar com o servidor.' }
  }
}

export async function createAsaasCharge(params: CreateAsaasChargeParams) {
  const res = await fetch(`${pb.baseUrl}/backend/v1/asaas/create-charge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token ? `Bearer ${pb.authStore.token}` : '',
    },
    body: JSON.stringify(params),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Falha ao criar cobrança Asaas')
  }
  return json
}

export async function cancelAsaasCharge(transactionId: string, paymentId?: string) {
  const res = await fetch(`${pb.baseUrl}/backend/v1/asaas/cancel-charge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token ? `Bearer ${pb.authStore.token}` : '',
    },
    body: JSON.stringify({ transaction_id: transactionId, payment_id: paymentId }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Falha ao cancelar cobrança Asaas')
  }
  return json
}
