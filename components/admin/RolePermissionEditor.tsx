'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRole, updateRole, deleteRole } from '@/actions/roles'
import { useRouter } from 'next/navigation'

export function RolePermissionEditor({
  roles,
  permissions,
}: {
  roles: any[]
  permissions: any[]
}) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const handleOpenCreate = () => {
    setEditingRole(null)
    setName('')
    setDescription('')
    setSelectedPermissions([])
    setDialogOpen(true)
  }

  const handleOpenEdit = (role: any) => {
    setEditingRole(role)
    setName(role.name)
    setDescription(role.description || '')
    setSelectedPermissions(
      role.role_permissions?.map((rp: any) => rp.permissions.id) || []
    )
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = editingRole
      ? await updateRole(editingRole.id, name, description, selectedPermissions)
      : await createRole(name, description, selectedPermissions)

    if (result.error) {
      alert(result.error)
    } else {
      setDialogOpen(false)
      router.refresh()
    }
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    const result = await deleteRole(roleId)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleOpenCreate}>Create Role</Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.role_permissions?.map((rp: any) => (
                      <span
                        key={rp.permissions.id}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                      >
                        {rp.permissions.key}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(role)}
                    >
                      Edit
                    </Button>
                    {role.name !== 'Owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Update role details and permissions'
                : 'Create a new role with specific permissions'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="rounded"
                    />
                    <div>
                      <div className="text-sm font-medium">{perm.key}</div>
                      <div className="text-xs text-gray-500">
                        {perm.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingRole ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
