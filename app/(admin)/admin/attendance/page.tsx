import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const { supabase, user } = await createClient()

  if (!user) {
    return null
  }

  const { data: orgId } = await supabase.rpc('get_user_org_id', {
    user_id: user.id,
  })

  if (!orgId) {
    return null
  }

  const selectedDate = searchParams.date || format(new Date(), 'yyyy-MM-dd')

  // Get attendance for selected date
  const { data: attendances } = await supabase
    .from('attendances')
    .select('*, employees(first_name, last_name, employee_code)')
    .eq('org_id', orgId)
    .eq('date', selectedDate)
    .order('clock_in', { ascending: true })

  // Get stats
  const presentCount = attendances?.filter(a => a.status === 'present').length || 0
  const lateCount = attendances?.filter(a => a.status === 'late').length || 0
  const absentCount = attendances?.filter(a => a.status === 'absent').length || 0
  const leaveCount = attendances?.filter(a => a.status === 'leave').length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">การเข้างาน</h1>
          <p className="text-gray-600">บันทึกการเข้า-ออกงานของพนักงาน</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            defaultValue={selectedDate}
            className="rounded-md border px-3 py-2"
            onChange={(e) => {
              window.location.href = `/admin/attendance?date=${e.target.value}`
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ตรงเวลา</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">มาสาย</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lateCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ขาดงาน</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลา</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{leaveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>เวลาเข้า</TableHead>
              <TableHead>เวลาออก</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>สาย (นาที)</TableHead>
              <TableHead>OT (นาที)</TableHead>
              <TableHead>หมายเหตุ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances && attendances.length > 0 ? (
              attendances.map((att: any) => (
                <TableRow key={att.id}>
                  <TableCell className="font-medium">{att.employees?.employee_code || '-'}</TableCell>
                  <TableCell>
                    {att.employees?.first_name} {att.employees?.last_name}
                  </TableCell>
                  <TableCell>
                    {att.clock_in ? format(new Date(att.clock_in), 'HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    {att.clock_out ? format(new Date(att.clock_out), 'HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      att.status === 'present' ? 'bg-green-100 text-green-700' :
                      att.status === 'late' ? 'bg-orange-100 text-orange-700' :
                      att.status === 'absent' ? 'bg-red-100 text-red-700' :
                      att.status === 'leave' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {att.status === 'present' && 'ตรงเวลา'}
                      {att.status === 'late' && 'มาสาย'}
                      {att.status === 'absent' && 'ขาดงาน'}
                      {att.status === 'leave' && 'ลา'}
                      {att.status === 'half-day' && 'ครึ่งวัน'}
                      {att.status === 'holiday' && 'วันหยุด'}
                    </span>
                  </TableCell>
                  <TableCell className={att.late_minutes > 0 ? 'text-orange-600' : ''}>
                    {att.late_minutes || 0}
                  </TableCell>
                  <TableCell className={att.ot_minutes > 0 ? 'text-blue-600' : ''}>
                    {att.ot_minutes || 0}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{att.notes || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  ไม่มีข้อมูลการเข้างานในวันที่เลือก
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
