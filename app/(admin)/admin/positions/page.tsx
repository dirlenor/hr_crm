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
import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default async function PositionsPage() {
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

  const { data: positions } = await supabase
    .from('positions')
    .select('*, departments(name), salary_structures(*), employees(id)')
    .eq('org_id', orgId)
    .order('departments(name)', { ascending: true })
    .order('level', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ตำแหน่ง</h1>
          <p className="text-gray-600">จัดการตำแหน่งและโครงสร้างเงินเดือน</p>
        </div>
        <Link href="/admin/positions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มตำแหน่ง
          </Button>
        </Link>
      </div>

      {positions && positions.length > 0 ? (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>แผนก</TableHead>
                <TableHead>ระดับ</TableHead>
                <TableHead>เงินเดือน (บาท)</TableHead>
                <TableHead>OT Rate</TableHead>
                <TableHead>พนักงาน</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos: any) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-medium">{pos.name}</TableCell>
                  <TableCell>{pos.departments?.name || '-'}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                      Level {pos.level}
                    </span>
                  </TableCell>
                  <TableCell>
                    {pos.salary_structures ? (
                      <span>
                        {Number(pos.salary_structures.base_salary_min).toLocaleString()} - {Number(pos.salary_structures.base_salary_max).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-400">ยังไม่กำหนด</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pos.salary_structures ? (
                      <span>x{pos.salary_structures.ot_rate_multiplier}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{pos.employees?.length || 0} คน</TableCell>
                  <TableCell>
                    <Link href={`/admin/positions/${pos.id}`}>
                      <Button variant="ghost" size="sm">แก้ไข</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีตำแหน่ง</p>
            <Link href="/admin/positions/new">
              <Button>เพิ่มตำแหน่งแรก</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
