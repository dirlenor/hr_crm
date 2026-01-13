'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, AlertCircle, User, Building2 } from 'lucide-react'
import { getEmployeeByInviteCode, linkEmployeeWithLine } from '@/actions/employees'

export default function LiffOnboardingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'loading' | 'invite' | 'link' | 'success'>('loading')
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [lineUser, setLineUser] = useState<any>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [linking, setLinking] = useState(false)

  // Check if running in LINE
  const isLine = typeof window !== 'undefined' && window.location.href.includes('liff.line.me')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (user && user.app_metadata?.provider === 'line') {
        setLineUser(user)
        const code = searchParams.get('code')
        if (code) {
          await loadEmployeeData(code)
        } else {
          setStep('invite')
        }
      } else {
        // Not authenticated - need to sign in with LINE
        setStep('invite')
      }
    } catch (err: any) {
      setError(err.message)
      setStep('invite')
    } finally {
      setLoading(false)
    }
  }

  const loadEmployeeData = async (code: string) => {
    try {
      const result = await getEmployeeByInviteCode(code)
      if (result.error) {
        setError(result.error)
        setStep('invite')
        return
      }
      setEmployeeData(result.data)
      setStep('link')
    } catch (err: any) {
      setError(err.message)
      setStep('invite')
    }
  }

  const handleLineSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'line',
        options: {
          redirectTo: `${window.location.origin}/liff/onboarding?code=${inviteCode || searchParams.get('code') || ''}`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleLinkAccount = async () => {
    if (!employeeData || !lineUser) return

    setLinking(true)
    setError(null)

    try {
      const lineUserId = lineUser.user_metadata?.sub || lineUser.user_metadata?.line_user_id

      if (!lineUserId) {
        setError('ไม่พบ LINE User ID')
        setLinking(false)
        return
      }

      const result = await linkEmployeeWithLine(
        employeeData.employee_code,
        lineUserId,
        lineUser.id
      )

      if (result.error) {
        setError(result.error)
        setLinking(false)
        return
      }

      setStep('success')
    } catch (err: any) {
      setError(err.message)
      setLinking(false)
    }
  }

  const handleInviteCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode) return

    setLoading(true)
    await loadEmployeeData(inviteCode)
  }

  if (loading && step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Invite Code Input */}
        {step === 'invite' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                ลงทะเบียนพนักงาน
              </CardTitle>
              <CardDescription>
                กรุณากรอก Invite Code ที่ได้รับจาก Admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-danger bg-danger-50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-danger" />
                    <p className="text-sm text-danger-600">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleInviteCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite_code">Invite Code</Label>
                  <Input
                    id="invite_code"
                    placeholder="ABCD1234"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="font-mono text-center text-lg"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || !inviteCode}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  ดำเนินการต่อ
                </Button>
              </form>

              {!isLine && (
                <div className="rounded-lg border border-warning bg-warning-50 p-3">
                  <p className="text-xs text-warning-700">
                    💡 แนะนำให้เปิดผ่าน LINE เพื่อความสะดวก
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Link Account */}
        {step === 'link' && employeeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                ยืนยันข้อมูล
              </CardTitle>
              <CardDescription>
                ตรวจสอบข้อมูลและเชื่อมต่อกับ LINE Account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-danger bg-danger-50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-danger" />
                    <p className="text-sm text-danger-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Employee Info */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-lg avatar-primary">
                    {employeeData.first_name[0]}{employeeData.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {employeeData.first_name} {employeeData.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      รหัส: {employeeData.employee_code}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">แผนก</p>
                    <p className="font-medium">{employeeData.departments?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ตำแหน่ง</p>
                    <p className="font-medium">{employeeData.positions?.name || '-'}</p>
                  </div>
                </div>
              </div>

              {/* LINE Account Info */}
              {lineUser && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground mb-2">LINE Account</p>
                  <div className="flex items-center gap-2">
                    {lineUser.user_metadata?.picture && (
                      <img
                        src={lineUser.user_metadata.picture}
                        alt="LINE Avatar"
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <p className="font-medium">
                      {lineUser.user_metadata?.name || lineUser.email || 'LINE User'}
                    </p>
                  </div>
                </div>
              )}

              {!lineUser && (
                <Button
                  onClick={handleLineSignIn}
                  className="w-full"
                  variant="outline"
                >
                  เข้าสู่ระบบด้วย LINE
                </Button>
              )}

              {lineUser && (
                <Button
                  onClick={handleLinkAccount}
                  className="w-full"
                  disabled={linking}
                >
                  {linking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  เชื่อมต่อบัญชี
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {step === 'success' && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">ลงทะเบียนสำเร็จ!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    บัญชีของคุณถูกเชื่อมต่อแล้ว
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/liff/dashboard')}
                  className="w-full"
                >
                  ไปที่ Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
