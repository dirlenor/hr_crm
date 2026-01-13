'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createDepartment } from '@/actions/departments'
import { Loader2, AlertCircle } from 'lucide-react'

export function CreateDepartmentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createDepartment({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Success - redirect with cache busting
      // Add timestamp to force fresh data fetch
      const timestamp = new Date().getTime()
      window.location.href = `/admin/departments?t=${timestamp}`
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลแผนก</CardTitle>
        <CardDescription>กรอกข้อมูลแผนกที่ต้องการสร้าง</CardDescription>
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              สร้างแผนก
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
