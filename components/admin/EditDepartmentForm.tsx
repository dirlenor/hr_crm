'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateDepartment, deleteDepartment } from '@/actions/departments'
import { Loader2, AlertCircle, Trash2 } from 'lucide-react'
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

interface EditDepartmentFormProps {
  department: {
    id: string
    name: string
    description: string | null
  }
}

export function EditDepartmentForm({ department }: EditDepartmentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: department.name,
    description: department.description || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await updateDepartment(department.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Redirect to departments list
      router.push('/admin/departments')
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
      const result = await deleteDepartment(department.id)

      if (result.error) {
        setError(result.error)
        setDeleting(false)
        return
      }

      // Redirect to departments list
      router.push('/admin/departments')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลแผนก</CardTitle>
        <CardDescription>แก้ไขข้อมูลแผนก</CardDescription>
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

          <div className="space-y-2">
            <Label htmlFor="name">ชื่อแผนก *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ฝ่ายขาย, ฝ่ายบัญชี"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="อธิบายเกี่ยวกับแผนกนี้ (ไม่บังคับ)"
            />
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
                  ลบแผนก
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการลบแผนก</AlertDialogTitle>
                  <AlertDialogDescription>
                    คุณแน่ใจหรือไม่ว่าต้องการลบแผนก "{department.name}"? 
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
                onClick={() => router.back()}
                disabled={loading || deleting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading || deleting || !formData.name.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึก
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
