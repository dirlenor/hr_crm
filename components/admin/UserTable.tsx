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
import {
  createInviteCode,
  assignRoleToUser,
  removeRoleFromUser,
  updateUserStatus,
} from '@/actions/users'
import { useRouter } from 'next/navigation'

export function UserTable({ users, roles }: { users: any[]; roles: any[] }) {
  const router = useRouter()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [maxUses, setMaxUses] = useState(1)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createInviteCode(selectedRole, maxUses)
    if (result.data) {
      setGeneratedCode(result.data.code)
    } else {
      alert(result.error)
    }
  }

  const handleAssignRole = async (userId: string, roleId: string) => {
    await assignRoleToUser(userId, roleId)
    router.refresh()
  }

  const handleRemoveRole = async (userId: string, roleId: string) => {
    await removeRoleFromUser(userId, roleId)
    router.refresh()
  }

  const handleUpdateStatus = async (userId: string, status: 'active' | 'suspended') => {
    await updateUserStatus(userId, status)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Invite Code</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Invite Code</DialogTitle>
              <DialogDescription>
                Generate a code for users to join your organization
              </DialogDescription>
            </DialogHeader>
            {generatedCode ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-800">
                    Invite code created!
                  </p>
                  <p className="mt-2 text-2xl font-bold">{generatedCode}</p>
                </div>
                <Button
                  onClick={() => {
                    setGeneratedCode(null)
                    setInviteDialogOpen(false)
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <Label htmlFor="role">Role to Assign</Label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Generate Code</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.display_name || user.email || 'Unknown'}
                </TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.user_roles?.map((ur: any) => (
                      <span
                        key={ur.roles.id}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                      >
                        {ur.roles.name}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status || 'active'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignRole(user.id, e.target.value)
                        }
                      }}
                      className="rounded-md border px-2 py-1 text-sm"
                    >
                      <option value="">Add Role</option>
                      {roles
                        .filter(
                          (role) =>
                            !user.user_roles?.some(
                              (ur: any) => ur.roles.id === role.id
                            )
                        )
                        .map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(
                          user.id,
                          user.status === 'active' ? 'suspended' : 'active'
                        )
                      }
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
