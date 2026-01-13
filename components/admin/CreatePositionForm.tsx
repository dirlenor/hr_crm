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
import { createPosition } from '@/actions/positions'
import { Loader2, AlertCircle } from 'lucide-react'

interface CreatePositionFormProps {
  departments: Array<{ id: string; name: string }>
}

export function CreatePositionForm({ departments }: CreatePositionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    level: '3',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.department_id) {
      setError('กรุณาเลือกแผนก')
      setLoading(false)
      return
    }

    try {
      const result = await createPosition({
        name: formData.name.trim(),
        department_id: formData.department_id,
        level: parseInt(formData.level) || 3,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Redirect to positions list
      router.push('/admin/positions')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลตำแหน่ง</CardTitle>
        <CardDescription>กรอกข้อมูลตำแหน่งที่ต้องการสร้าง</CardDescription>
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
            <Label htmlFor="department_id">แผนก *</Label>
            <Select
              value={formData.department_id}
              onValueChange={(value) => setFormData({ ...formData, department_id: value })}
              required
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
            <Label htmlFor="name">ชื่อตำแหน่ง *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น Manager, Developer, พนักงานขาย"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">ระดับ (1-5) *</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1 (สูงสุด)</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3 (มาตรฐาน)</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5 (ต่ำสุด)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim() || !formData.department_id}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              สร้างตำแหน่ง
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
