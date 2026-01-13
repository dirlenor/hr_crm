'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEmployee } from '@/actions/employees'
import { createDepartment } from '@/actions/departments'
import { createPosition } from '@/actions/positions'
import { Loader2, CheckCircle, Copy, QrCode, ExternalLink, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CreateEmployeeFormProps {
  departments: Array<{ id: string; name: string }>
  positions: Array<{ id: string; name: string; department_id: string | null }>
  schedules: Array<{ id: string; name: string }>
}

export function CreateEmployeeForm({
  departments: initialDepartments,
  positions: initialPositions,
  schedules,
}: CreateEmployeeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<any>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  
  // State for departments and positions (can be updated dynamically)
  const [departments, setDepartments] = useState(initialDepartments)
  const [positions, setPositions] = useState(initialPositions)
  
  // State for create dialogs
  const [showCreateDeptDialog, setShowCreateDeptDialog] = useState(false)
  const [showCreatePosDialog, setShowCreatePosDialog] = useState(false)
  const [creatingDept, setCreatingDept] = useState(false)
  const [creatingPos, setCreatingPos] = useState(false)
  
  // Form state for new department
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptDescription, setNewDeptDescription] = useState('')
  
  // Form state for new position
  const [newPosName, setNewPosName] = useState('')
  const [newPosLevel, setNewPosLevel] = useState('3')

  // Form state
  const [formData, setFormData] = useState({
    employee_code: '',
    first_name: '',
    last_name: '',
    nickname: '',
    email: '',
    phone: '',
    department_id: '',
    position_id: '',
    employment_type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'intern',
    start_date: new Date().toISOString().split('T')[0],
    base_salary: '',
  })

  // Filter positions by selected department
  const filteredPositions = formData.department_id
    ? positions.filter(p => p.department_id === formData.department_id || !p.department_id)
    : positions

  // Handle create department
  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) {
      setError('กรุณากรอกชื่อแผนก')
      return
    }

    setCreatingDept(true)
    setError(null) // Clear any previous errors

    try {
      const result = await createDepartment({
        name: newDeptName.trim(),
        description: newDeptDescription.trim() || null,
      })

      if (result.error) {
        setError(result.error)
        setCreatingDept(false)
        return
      }

      // Add new department to list
      setDepartments([...departments, result.data])
      
      // Auto-select the new department
      setFormData({ ...formData, department_id: result.data.id })
      
      // Close dialog and reset form
      setShowCreateDeptDialog(false)
      setNewDeptName('')
      setNewDeptDescription('')
      setError(null) // Clear error on success
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setCreatingDept(false)
    }
  }

  // Handle create position
  const handleCreatePosition = async () => {
    if (!newPosName.trim()) {
      setError('กรุณากรอกชื่อตำแหน่ง')
      return
    }

    if (!formData.department_id) {
      setError('กรุณาเลือกแผนกก่อน')
      return
    }

    setCreatingPos(true)
    setError(null)

    try {
      const result = await createPosition({
        name: newPosName.trim(),
        department_id: formData.department_id,
        level: parseInt(newPosLevel) || 3,
      })

      if (result.error) {
        setError(result.error)
        setCreatingPos(false)
        return
      }

      // Add new position to list
      setPositions([...positions, result.data])
      
      // Auto-select the new position
      setFormData({ ...formData, position_id: result.data.id })
      
      // Close dialog and reset form
      setShowCreatePosDialog(false)
      setNewPosName('')
      setNewPosLevel('3')
      setError(null) // Clear error on success
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setCreatingPos(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createEmployee({
        employee_code: formData.employee_code || undefined,
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickname: formData.nickname || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        department_id: formData.department_id || undefined,
        position_id: formData.position_id || undefined,
        employment_type: formData.employment_type,
        start_date: formData.start_date,
        base_salary: formData.base_salary ? parseFloat(formData.base_salary) : undefined,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      setSuccess(result.data)
      setShowInviteDialog(true)
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
      setLoading(false)
    }
  }

  const inviteLink = success?.invite_code
    ? `${window.location.origin}/liff/onboarding?code=${success.invite_code}`
    : ''

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      // Show toast or feedback
    }
  }

  const handleCloseDialog = () => {
    setShowInviteDialog(false)
    router.push('/admin/employees')
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
            <CardDescription>กรอกข้อมูลส่วนตัวของพนักงาน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee_code">รหัสพนักงาน</Label>
                <Input
                  id="employee_code"
                  placeholder="EMP001 (ไม่บังคับ)"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">ถ้าไม่กรอก ระบบจะสร้างให้อัตโนมัติ</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">ประเภทการจ้าง</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value: any) => setFormData({ ...formData, employment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">พนักงานประจำ</SelectItem>
                    <SelectItem value="part-time">พาร์ทไทม์</SelectItem>
                    <SelectItem value="contract">สัญญาจ้าง</SelectItem>
                    <SelectItem value="intern">ฝึกงาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">ชื่อ *</Label>
                <Input
                  id="first_name"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">นามสกุล *</Label>
                <Input
                  id="last_name"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">ชื่อเล่น</Label>
                <Input
                  id="nickname"
                  placeholder="(ไม่บังคับ)"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="081-234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลองค์กร</CardTitle>
            <CardDescription>กำหนดแผนก ตำแหน่ง และวันเริ่มงาน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department_id">แผนก</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, department_id: value, position_id: '' })
                    }}
                    className="flex-1"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCreateDeptDialog(true)}
                    title="สร้างแผนกใหม่"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position_id">ตำแหน่ง</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.position_id}
                    onValueChange={(value) => setFormData({ ...formData, position_id: value })}
                    disabled={!formData.department_id}
                    className="flex-1"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.department_id ? "เลือกตำแหน่ง" : "เลือกแผนกก่อน"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCreatePosDialog(true)}
                    disabled={!formData.department_id}
                    title="สร้างตำแหน่งใหม่"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">วันเริ่มงาน *</Label>
                <Input
                  id="start_date"
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_salary">เงินเดือน (บาท)</Label>
                <Input
                  id="base_salary"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25000"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-danger bg-danger-50 p-4">
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            สร้างพนักงานและสร้าง Invite Link
          </Button>
        </div>
      </form>

      {/* Success Dialog - Invite Link */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              สร้างพนักงานสำเร็จ!
            </DialogTitle>
            <DialogDescription>
              ส่ง Invite Link นี้ให้พนักงานเพื่อลงทะเบียนผ่าน LINE
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Info */}
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium">
                {success?.first_name} {success?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                รหัส: {success?.employee_code || '-'}
              </p>
            </div>

            {/* Invite Code */}
            <div className="space-y-2">
              <Label>Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  value={success?.invite_code || ''}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(success?.invite_code || '')
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Invite Link */}
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyInviteLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(inviteLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="rounded-lg border border-dashed p-8 text-center">
              <QrCode className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                QR Code จะแสดงที่นี่ (ต้องติดตั้ง QR library)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              ปิด
            </Button>
            <Button onClick={copyInviteLink}>
              <Copy className="mr-2 h-4 w-4" />
              คัดลอก Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Department Dialog */}
      <Dialog 
        open={showCreateDeptDialog} 
        onOpenChange={(open) => {
          setShowCreateDeptDialog(open)
          if (!open) {
            // Clear form and error when closing
            setNewDeptName('')
            setNewDeptDescription('')
            setError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างแผนกใหม่</DialogTitle>
            <DialogDescription>
              เพิ่มแผนกใหม่ในองค์กร
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_dept_name">ชื่อแผนก *</Label>
              <Input
                id="new_dept_name"
                value={newDeptName}
                onChange={(e) => {
                  setNewDeptName(e.target.value)
                  setError(null) // Clear error when typing
                }}
                placeholder="เช่น ฝ่ายขาย"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_dept_description">รายละเอียด</Label>
              <Input
                id="new_dept_description"
                value={newDeptDescription}
                onChange={(e) => setNewDeptDescription(e.target.value)}
                placeholder="(ไม่บังคับ)"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-danger bg-danger-50 p-3">
                <p className="text-sm text-danger-600">{error}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDeptDialog(false)
                  setNewDeptName('')
                  setNewDeptDescription('')
                  setError(null)
                }}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={handleCreateDepartment}
                disabled={creatingDept || !newDeptName.trim()}
              >
                {creatingDept && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                สร้างแผนก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Position Dialog */}
      <Dialog 
        open={showCreatePosDialog} 
        onOpenChange={(open) => {
          setShowCreatePosDialog(open)
          if (!open) {
            // Clear form and error when closing
            setNewPosName('')
            setNewPosLevel('3')
            setError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้างตำแหน่งใหม่</DialogTitle>
            <DialogDescription>
              เพิ่มตำแหน่งใหม่ในแผนก{' '}
              <span className="font-medium">
                {departments.find(d => d.id === formData.department_id)?.name || ''}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_pos_name">ชื่อตำแหน่ง *</Label>
              <Input
                id="new_pos_name"
                value={newPosName}
                onChange={(e) => {
                  setNewPosName(e.target.value)
                  setError(null) // Clear error when typing
                }}
                placeholder="เช่น พนักงานขาย"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_pos_level">ระดับ (1-10)</Label>
              <Select value={newPosLevel} onValueChange={setNewPosLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="rounded-lg border border-danger bg-danger-50 p-3">
                <p className="text-sm text-danger-600">{error}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreatePosDialog(false)
                  setNewPosName('')
                  setNewPosLevel('3')
                  setError(null)
                }}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={handleCreatePosition}
                disabled={creatingPos || !newPosName.trim() || !formData.department_id}
              >
                {creatingPos && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                สร้างตำแหน่ง
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
