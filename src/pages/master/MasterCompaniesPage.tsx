import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, Upload, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function MasterCompaniesPage({ defaultTab = 'companies' }: { defaultTab?: string }) {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    bin_prefix: '',
    commission_rate: '',
    modality: '1',
    gateway_provider: 'Asaas',
    status: 'active',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('companies').getFullList({
        filter: defaultTab === 'bins' ? "deleted_at != ''" : "deleted_at = ''",
        sort: '-created',
      })
      setCompanies(records)
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao carregar empresas.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [defaultTab])

  const handleSave = async () => {
    if (!formData.name || !formData.bin_prefix || !formData.commission_rate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos corretamente.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('bin_prefix', formData.bin_prefix)
      data.append('commission_rate', formData.commission_rate)
      data.append('modality', formData.modality)
      data.append('gateway_provider', formData.gateway_provider)
      data.append('status', formData.status)
      if (logoFile) {
        data.append('logo', logoFile)
      }

      if (editingId) {
        await pb.collection('companies').update(editingId, data)
        toast({ title: 'Sucesso', description: 'Empresa atualizada com sucesso.' })
      } else {
        await pb.collection('companies').create(data)
        toast({ title: 'Sucesso', description: 'Empresa criada com sucesso.' })
      }
      setIsDialogOpen(false)
      loadCompanies()
      resetForm()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta empresa?')) return
    try {
      await pb.collection('companies').update(id, { deleted_at: new Date().toISOString() })
      toast({ title: 'Sucesso', description: 'Empresa movida para a lixeira.' })
      loadCompanies()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a empresa.',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      bin_prefix: '',
      commission_rate: '',
      modality: '1',
      gateway_provider: 'Asaas',
      status: 'active',
    })
    setLogoFile(null)
    setLogoPreview('')
    setEditingId(null)
  }

  const openEdit = (company: any) => {
    setFormData({
      name: company.name || '',
      bin_prefix: company.bin_prefix || '',
      commission_rate: company.commission_rate?.toString() || '',
      modality: company.modality || '1',
      gateway_provider: company.gateway_provider || 'Asaas',
      status: company.status || 'active',
    })
    if (company.logo) {
      setLogoPreview(pb.files.getURL(company, company.logo))
    } else {
      setLogoPreview('')
    }
    setEditingId(company.id)
    setIsDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {defaultTab === 'bins' ? 'Lixeira de Empresas' : 'Gestão de Empresas'}
          </h1>
          <p className="text-gray-500 mt-1">Gerencie as empresas cadastradas no sistema</p>
        </div>

        {defaultTab !== 'bins' && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) resetForm()
              setIsDialogOpen(open)
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex flex-col items-center gap-4 p-4 border border-dashed rounded-lg bg-gray-50">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-24 h-24 object-contain rounded-md bg-white border shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white border rounded-md flex flex-col items-center justify-center text-gray-400 shadow-sm">
                      <Building2 className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">Sem Logo</span>
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />{' '}
                      {logoPreview ? 'Alterar Logo' : 'Enviar Logo'}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input
                    placeholder="Ex: Acme Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prefixo BIN</Label>
                    <Input
                      placeholder="Ex: 543210"
                      value={formData.bin_prefix}
                      onChange={(e) => setFormData({ ...formData, bin_prefix: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa de Comissão (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 2.5"
                      value={formData.commission_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, commission_rate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modalidade</Label>
                    <Select
                      value={formData.modality}
                      onValueChange={(v) => setFormData({ ...formData, modality: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Fechada (1)</SelectItem>
                        <SelectItem value="2">Aberta (2)</SelectItem>
                        <SelectItem value="both">Ambas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gateway de Pagamento</Label>
                    <Select
                      value={formData.gateway_provider}
                      onValueChange={(v) => setFormData({ ...formData, gateway_provider: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asaas">Asaas</SelectItem>
                        <SelectItem value="Alternative">Alternativo</SelectItem>
                        <SelectItem value="None/Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status Operacional</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="inactive">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-20">Logo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>BIN</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Status</TableHead>
              {defaultTab !== 'bins' && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((c) => (
                <TableRow key={c.id} className="group">
                  <TableCell>
                    {c.logo ? (
                      <img
                        src={pb.files.getURL(c, c.logo)}
                        alt="Logo"
                        className="w-10 h-10 object-contain rounded bg-gray-50 border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-50 border rounded flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{c.name}</TableCell>
                  <TableCell className="text-gray-600">{c.bin_prefix}</TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {c.modality === 'both' ? 'Ambas' : c.modality === '1' ? 'Fechada' : 'Aberta'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {c.status === 'active' ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  {defaultTab !== 'bins' && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id)}
                          title="Excluir"
                        >
                          <Trash className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
