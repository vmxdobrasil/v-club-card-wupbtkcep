import { useState, useEffect } from 'react'
import { Plus, Trash2, Key, ShieldAlert } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const secretSchema = z.object({
  key: z
    .string()
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      'Secret key must be uppercase alphanumeric with underscores and start with a letter (e.g. ASAAS_API_KEY)',
    ),
  value: z.string().min(1, 'Value is required'),
})

type SecretFormValues = z.infer<typeof secretSchema>

export default function MasterSecretsPage() {
  const [secrets, setSecrets] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<SecretFormValues>({
    resolver: zodResolver(secretSchema),
    defaultValues: { key: '', value: '' },
  })

  const loadSecrets = async () => {
    try {
      const records = await pb.collection('platform_settings').getFullList({ sort: '-created' })
      setSecrets(records)
    } catch (error) {
      console.error('Failed to load secrets:', error)
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
      const existing = secrets.find((s) => s.key === data.key)
      if (existing) {
        await pb.collection('platform_settings').update(existing.id, { value: data.value })
        toast({ title: 'Success', description: 'Secret updated successfully.' })
      } else {
        await pb.collection('platform_settings').create(data)
        toast({ title: 'Success', description: 'Secret created successfully.' })
      }
      setIsOpen(false)
      form.reset()
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      let hasErrors = false
      Object.keys(fieldErrors).forEach((field) => {
        if (field === 'key' || field === 'value') {
          form.setError(field as keyof SecretFormValues, {
            type: 'manual',
            message: fieldErrors[field],
          })
          hasErrors = true
        }
      })
      if (!hasErrors) {
        toast({ title: 'Error', description: 'Failed to save secret.', variant: 'destructive' })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this secret?')) return
    try {
      await pb.collection('platform_settings').delete(id)
      toast({ title: 'Success', description: 'Secret deleted successfully.' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete secret.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Platform Secrets</h2>
          <p className="text-muted-foreground mt-1">
            Manage API keys and integration settings for the platform.
          </p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) form.reset()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Secret
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Platform Secret</DialogTitle>
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
                      <FormDescription>
                        Must start with a letter and contain only uppercase letters, numbers, and
                        underscores.
                      </FormDescription>
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
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Secret</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Sensitive Integration Keys
          </CardTitle>
          <CardDescription>
            These secrets are securely stored and utilized by edge functions and webhooks (such as
            the Asaas Webhook).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Secret Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[200px]">Last Updated</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secrets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                    <Key className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    No secrets found. Add an API key to configure integrations.
                  </TableCell>
                </TableRow>
              )}
              {secrets.map((secret) => (
                <TableRow key={secret.id}>
                  <TableCell className="font-mono font-medium">{secret.key}</TableCell>
                  <TableCell className="text-muted-foreground">••••••••••••••••••••</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(secret.updated).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(secret.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
