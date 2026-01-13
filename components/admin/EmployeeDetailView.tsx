'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateEmployee, deleteEmployee } from '@/actions/employees'
import { Loader2, AlertCircle, Trash2, Edit2, User, Mail, Phone, Building2, Briefcase, Calendar, DollarSign } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface EmployeeDetailViewProps {
  employee: any
  departments: Array<{ id: string; name: string }>
  positions: Array<{ id: string; name: string; department_id: string | null }>
  schedules: Array<{ id: string; name: string }>
}

export function EmployeeDetailView({
  employee: initialEmployee,
  departments,
  positions,
  schedules,
}: EmployeeDetailViewProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employee, setEmployee] = useState(initialEmployee)
  const [formData, setFormData] = useState({
    employee_code: employee.employee_code || '',
    first_name: employee.first_name,
    last_name: employee.last_name,
    nickname: employee.nickname || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department_id: employee.department_id || '',
    position_id: employee.position_id || '',
    employment_type: employee.employment_type || 'full-time',
    start_date: employee.start_date,
    base_salary: employee.base_salary?.toString() || '',
  })

  // Filter positions by selected department
  const filteredPositions = formData.department_id
    ? positions.filter((p) => p.department_id === formData.department_id || !p.department_id)
    : positions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await updateEmployee(employee.id, {
        employee_code: formData.employee_code || undefined,
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickname: formData.nickname || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        department_id: formData.department_id || undefined,
        position_id: formData.position_id || undefined,
        employment_type: formData.employment_type as any,
        start_date: formData.start_date,
        base_salary: formData.base_salary ? parseFloat(formData.base_salary) : undefined,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      setEmployee(result.data)
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const result = await deleteEmployee(employee.id)

      if (result.error) {
        setError(result.error)
        setDeleting(false)
        return
      }

      // Redirect to employees list
      router.push('/admin/employees')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
      setDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="page-header mb-0">
          <h1 className="page-title">แก้ไขข้อมูลพนักงาน</h1>
          <p className="page-description">แก้ไขข้อมูล: {employee.first_name} {employee.last_name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพนักงาน</CardTitle>
            <CardDescription>แก้ไขข้อมูลพนักงาน</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-danger bg-danger-50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-danger" />
                    <p className="text-sm text-danger-600">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">ชื่อ *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">นามสกุล *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname">ชื่อเล่น</Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_code">รหัสพนักงาน</Label>
                  <Input
                    id="employee_code"
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทร</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department_id">แผนก</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, department_id: value, position_id: '' })
                    }}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position_id">ตำแหน่ง</Label>
                  <Select
                    value={formData.position_id}
                    onValueChange={(value) => setFormData({ ...formData, position_id: value })}
                    disabled={!formData.department_id}
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

                <div className="space-y-2">
                  <Label htmlFor="start_date">วันเริ่มงาน *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_salary">เงินเดือน (บาท)</Label>
                  <Input
                    id="base_salary"
                    type="number"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={loading || deleting}
                    >
                      {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Trash2 className="mr-2 h-4 w-4" />
                      ลบพนักงาน
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ยืนยันการลบพนักงาน</AlertDialogTitle>
                      <AlertDialogDescription>
                        คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน "{employee.first_name} {employee.last_name}"? 
                        การกระทำนี้ไม่สามารถยกเลิกได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        ลบ
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        employee_code: employee.employee_code || '',
                        first_name: employee.first_name,
                        last_name: employee.last_name,
                        nickname: employee.nickname || '',
                        email: employee.email || '',
                        phone: employee.phone || '',
                        department_id: employee.department_id || '',
                        position_id: employee.position_id || '',
                        employment_type: employee.employment_type || 'full-time',
                        start_date: employee.start_date,
                        base_salary: employee.base_salary?.toString() || '',
                      })
                    }}
                    disabled={loading || deleting}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={loading || deleting}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    บันทึก
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">ข้อมูลพนักงาน</h1>
          <p className="page-description">
            {employee.first_name} {employee.last_name}
            {employee.nickname && ` (${employee.nickname})`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            แก้ไข
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              ข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">รหัสพนักงาน</Label>
              <p className="font-mono">{employee.employee_code || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">ชื่อ-นามสกุล</Label>
              <p className="font-medium">{employee.first_name} {employee.last_name}</p>
            </div>
            {employee.nickname && (
              <div>
                <Label className="text-muted-foreground">ชื่อเล่น</Label>
                <p>{employee.nickname}</p>
              </div>
            )}
            {employee.email && (
              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p>{employee.email}</p>
              </div>
            )}
            {employee.phone && (
              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  เบอร์โทร
                </Label>
                <p>{employee.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              ข้อมูลองค์กร
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                แผนก
              </Label>
              <p>{employee.departments?.name || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                ตำแหน่ง
              </Label>
              <p>{employee.positions?.name || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">ประเภทการจ้าง</Label>
              <p>
                {employee.employment_type === 'full-time' && 'พนักงานประจำ'}
                {employee.employment_type === 'part-time' && 'พาร์ทไทม์'}
                {employee.employment_type === 'contract' && 'สัญญาจ้าง'}
                {employee.employment_type === 'intern' && 'ฝึกงาน'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                วันเริ่มงาน
              </Label>
              <p>{format(new Date(employee.start_date), 'd MMM yyyy', { locale: th })}</p>
            </div>
            {employee.base_salary && (
              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  เงินเดือน
                </Label>
                <p className="font-medium">{Number(employee.base_salary).toLocaleString()} บาท</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Invite */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-muted-foreground">สถานะ</Label>
                <div className="mt-1">
                  {employee.status === 'active' && <span className="badge-success">ทำงานอยู่</span>}
                  {employee.status === 'pending' && <span className="badge-warning">รอลงทะเบียน</span>}
                  {employee.status === 'resigned' && <span className="badge-neutral">ลาออก</span>}
                  {employee.status === 'terminated' && <span className="badge-danger">เลิกจ้าง</span>}
                </div>
              </div>
              {employee.status === 'pending' && employee.invite_code && (
                <div>
                  <Label className="text-muted-foreground">Invite Code</Label>
                  <p className="font-mono text-sm">{employee.invite_code}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
