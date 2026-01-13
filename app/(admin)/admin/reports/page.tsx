import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, Clock, CalendarDays, Wallet, Download } from 'lucide-react'
import Link from 'next/link'

const reports = [
  {
    title: 'รายงานพนักงาน',
    description: 'รายชื่อพนักงานทั้งหมดพร้อมข้อมูลพื้นฐาน',
    icon: Users,
    href: '/admin/reports/employees',
  },
  {
    title: 'รายงานการเข้างาน',
    description: 'สรุปการเข้างาน มาสาย ขาดงาน รายเดือน',
    icon: Clock,
    href: '/admin/reports/attendance',
  },
  {
    title: 'รายงานการลา',
    description: 'สรุปการลาและยอดวันลาคงเหลือ',
    icon: CalendarDays,
    href: '/admin/reports/leaves',
  },
  {
    title: 'รายงานเงินเดือน',
    description: 'สรุปเงินเดือนรายเดือน/รายปี',
    icon: Wallet,
    href: '/admin/reports/payroll',
  },
  {
    title: 'รายงาน OT',
    description: 'สรุปชั่วโมง OT และค่าล่วงเวลา',
    icon: FileText,
    href: '/admin/reports/ot',
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">รายงาน</h1>
        <p className="text-gray-600">ดูและ Export รายงานต่างๆ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <report.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{report.description}</p>
              <div className="flex gap-2">
                <Link href={report.href}>
                  <Button variant="outline" size="sm">ดูรายงาน</Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
