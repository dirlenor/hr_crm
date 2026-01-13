'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CalendarDays, Wallet, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function LiffDashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<any>(null)
  const [attendance, setAttendance] = useState<any>(null)
  const [today] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.app_metadata?.provider !== 'line') {
        router.push('/liff/onboarding')
        return
      }

      const lineUserId = user.user_metadata?.sub || user.user_metadata?.line_user_id

      // Get employee data
      const { data: empData } = await supabase
        .from('employees')
        .select('*, departments(name), positions(name)')
        .eq('line_user_id', lineUserId)
        .eq('status', 'active')
        .single()

      if (!empData) {
        router.push('/liff/onboarding')
        return
      }

      setEmployee(empData)

      // Get today's attendance
      const { data: attData } = await supabase
        .from('attendances')
        .select('*')
        .eq('employee_id', empData.id)
        .eq('date', today)
        .single()

      setAttendance(attData)
    } catch (err: any) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async () => {
    if (!employee) return

    try {
      const { error } = await supabase
        .from('attendances')
        .insert({
          org_id: employee.org_id,
          employee_id: employee.id,
          date: today,
          clock_in: new Date().toISOString(),
          status: 'present',
        })

      if (error) throw error

      await loadData()
    } catch (err: any) {
      console.error('Error clocking in:', err)
      alert('เกิดข้อผิดพลาด: ' + err.message)
    }
  }

  const handleClockOut = async () => {
    if (!employee || !attendance) return

    try {
      const { error } = await supabase
        .from('attendances')
        .update({
          clock_out: new Date().toISOString(),
        })
        .eq('id', attendance.id)

      if (error) throw error

      await loadData()
    } catch (err: any) {
      console.error('Error clocking out:', err)
      alert('เกิดข้อผิดพลาด: ' + err.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/liff/onboarding')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">ไม่พบข้อมูลพนักงาน</p>
      </div>
    )
  }

  const canClockIn = !attendance || !attendance.clock_in
  const canClockOut = attendance && attendance.clock_in && !attendance.clock_out

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'd MMMM yyyy', { locale: th })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Employee Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="avatar avatar-lg avatar-primary">
                {employee.first_name[0]}{employee.last_name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {employee.positions?.name || '-'} • {employee.departments?.name || '-'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  รหัส: {employee.employee_code}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clock In/Out */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              เข้า-ออกงาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attendance?.clock_in && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">เวลาเข้า</p>
                <p className="font-medium">
                  {format(new Date(attendance.clock_in), 'HH:mm น.', { locale: th })}
                </p>
              </div>
            )}

            {attendance?.clock_out && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">เวลาออก</p>
                <p className="font-medium">
                  {format(new Date(attendance.clock_out), 'HH:mm น.', { locale: th })}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {canClockIn && (
                <Button onClick={handleClockIn} className="flex-1">
                  <Clock className="mr-2 h-4 w-4" />
                  เข้างาน
                </Button>
              )}
              {canClockOut && (
                <Button onClick={handleClockOut} variant="outline" className="flex-1">
                  <Clock className="mr-2 h-4 w-4" />
                  ออกงาน
                </Button>
              )}
              {!canClockIn && !canClockOut && (
                <div className="w-full rounded-lg border bg-muted/50 p-3 text-center">
                  <p className="text-sm text-muted-foreground">บันทึกการเข้างานแล้ว</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-interactive">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <CalendarDays className="mx-auto h-8 w-8 text-primary" />
                <p className="text-sm font-medium">ขอลา</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Wallet className="mx-auto h-8 w-8 text-primary" />
                <p className="text-sm font-medium">สลิปเงินเดือน</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
