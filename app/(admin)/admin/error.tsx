'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertCircle className="h-5 w-5" />
            เกิดข้อผิดพลาด
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            {error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              ลองอีกครั้ง
            </Button>
            <Button onClick={() => window.location.href = '/admin/dashboard'}>
              กลับไปหน้า Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
