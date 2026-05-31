import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, KeyRound } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

const secretSchema = z.object({
  key: z
    .string()
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      'Secret key must be uppercase alphanumeric with underscores and start with a letter (e.g. MY_SECRET)',
    ),
  value: z.string().min(1, 'Value is required'),
})

type SecretFormValues = z.infer<typeof secretSchema>

export default function MasterSecretsPage() {
  const [secrets, setSecrets] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<SecretFormValues>({
    resolver: zodResolver(secretSchema),
    defaultValues: {
      key: '',
      value: '',
    },
  })

  const loadSecrets = async () => {
    try {
      const records = await pb.collection('platform_settings').getFullList({
        sort: 'key',
      })
      setSecrets(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadSecrets()
  }, [])

  useRealtime('platform_settings', () => {
    loadSecrets()
  })

  const onSubmit = async (data: SecretFormValues) => {
    try {
      await pb.collection('platform_settings').create(data)
      setOpen(false)
      form.reset()
      toast({ title: 'Secret created successfully' })
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      if (fieldErrors.key) {
        form.setError('key', { message: fieldErrors.key })
      } else {
        toast({ title: 'Error creating secret', variant: 'destructive' })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this secret?')) return
    try {
      await pb.collection('platform_settings').delete(id)
      toast({ title: 'Secret deleted successfully' })
    } catch (err) {
      toast({ title: 'Error deleting secret', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage system secrets and environment variables.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Add New Secret</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ASAAS_API_KEY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter secret value..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit">Save Secret</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secrets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No secrets configured.
                </TableCell>
              </TableRow>
            ) : (
              secrets.map((secret) => (
                <TableRow key={secret.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                      <span>{secret.key}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono bg-muted px-2 py-1 rounded text-sm text-muted-foreground">
                      ••••••••••••••••
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(secret.id)}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
