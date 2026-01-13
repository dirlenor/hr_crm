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
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { Plus, Wallet } from 'lucide-react'
import Link from 'next/link'

export default async function PayrollPage() {
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

  // Get payroll periods
  const { data: payrollPeriods } = await supabase
    .from('payroll_periods')
    .select('*, payroll_items(id, net_salary)')
    .eq('org_id', orgId)
    .order('start_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">เงินเดือน</h1>
          <p className="text-gray-600">จัดการและคำนวณเงินเดือนพนักงาน</p>
        </div>
        <Link href="/admin/payroll/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            สร้างงวดเงินเดือน
          </Button>
        </Link>
      </div>

      {payrollPeriods && payrollPeriods.length > 0 ? (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>งวด</TableHead>
                <TableHead>ช่วงวันที่</TableHead>
                <TableHead>วันจ่าย</TableHead>
                <TableHead>จำนวนพนักงาน</TableHead>
                <TableHead>ยอดรวม</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollPeriods.map((period: any) => {
                const totalNet = period.payroll_items?.reduce((sum: number, item: any) => sum + (item.net_salary || 0), 0) || 0
                const employeeCount = period.payroll_items?.length || 0
                
                return (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.name}</TableCell>
                    <TableCell>
                      {format(new Date(period.start_date), 'dd/MM/yyyy')} - {format(new Date(period.end_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {period.pay_date ? format(new Date(period.pay_date), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>{employeeCount} คน</TableCell>
                    <TableCell className="font-medium">
                      {totalNet.toLocaleString()} บาท
                    </TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        period.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        period.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        period.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        period.status === 'paid' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {period.status === 'draft' && 'ร่าง'}
                        {period.status === 'processing' && 'กำลังดำเนินการ'}
                        {period.status === 'approved' && 'อนุมัติแล้ว'}
                        {period.status === 'paid' && 'จ่ายแล้ว'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/payroll/${period.id}`}>
                        <Button variant="ghost" size="sm">ดูรายละเอียด</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีงวดเงินเดือน</p>
            <Link href="/admin/payroll/new">
              <Button>สร้างงวดเงินเดือนแรก</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
