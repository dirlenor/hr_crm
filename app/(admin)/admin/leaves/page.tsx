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
import { CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function LeavesPage({
  searchParams,
}: {
  searchParams: { status?: string }
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

  const statusFilter = searchParams.status || 'pending'

  // Get leave requests
  let query = supabase
    .from('leave_requests')
    .select('*, employees(first_name, last_name, employee_code), leave_types(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: leaveRequests } = await query

  // Get stats
  const { data: stats } = await supabase
    .from('leave_requests')
    .select('status')
    .eq('org_id', orgId)

  const pendingCount = stats?.filter(s => s.status === 'pending').length || 0
  const approvedCount = stats?.filter(s => s.status === 'approved').length || 0
  const rejectedCount = stats?.filter(s => s.status === 'rejected').length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">การลา</h1>
          <p className="text-gray-600">จัดการคำขอลาและอนุมัติ</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className={`cursor-pointer hover:shadow-md ${statusFilter === 'pending' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => window.location.href = '/admin/leaves?status=pending'}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รออนุมัติ</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:shadow-md ${statusFilter === 'approved' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => window.location.href = '/admin/leaves?status=approved'}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:shadow-md ${statusFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => window.location.href = '/admin/leaves?status=rejected'}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ปฏิเสธ</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>พนักงาน</TableHead>
              <TableHead>ประเภทลา</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>จำนวนวัน</TableHead>
              <TableHead>เหตุผล</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests && leaveRequests.length > 0 ? (
              leaveRequests.map((leave: any) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {leave.employees?.first_name} {leave.employees?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{leave.employees?.employee_code}</p>
                    </div>
                  </TableCell>
                  <TableCell>{leave.leave_types?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(new Date(leave.start_date), 'dd/MM/yyyy')}</p>
                      {leave.start_date !== leave.end_date && (
                        <p className="text-gray-500">ถึง {format(new Date(leave.end_date), 'dd/MM/yyyy')}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{leave.total_days} วัน</TableCell>
                  <TableCell className="max-w-xs truncate">{leave.reason || '-'}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      leave.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                      leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {leave.status === 'pending' && 'รออนุมัติ'}
                      {leave.status === 'approved' && 'อนุมัติแล้ว'}
                      {leave.status === 'rejected' && 'ปฏิเสธ'}
                      {leave.status === 'cancelled' && 'ยกเลิก'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {leave.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-green-600">
                          อนุมัติ
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          ปฏิเสธ
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  ไม่มีคำขอลา
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
