'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createOrg, redeemInviteCode } from '@/actions/org'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select')
  const [orgName, setOrgName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{
    email?: string
    displayName?: string
    avatarUrl?: string
    authProvider?: string
  } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false
    
    async function loadUser() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (cancelled) return

        if (userError) {
          console.error('Error getting user:', userError)
          router.push('/auth/sign-in')
          return
        }

        if (user) {
          // Use RPC to check if user has org (middleware will handle redirect)
          const { data: orgId } = await supabase.rpc('get_user_org_id', {
            user_id: user.id,
          })

          if (cancelled) return

          // If user has profile, redirect to dashboard (middleware should handle this, but just in case)
          if (orgId) {
            router.push('/admin/dashboard')
            return
          }

          const authProvider = user.app_metadata?.provider === 'line' ? 'line' : 'email'
          const displayName = user.user_metadata?.name || user.user_metadata?.display_name || user.email || ''
          const avatarUrl = user.user_metadata?.picture || user.user_metadata?.avatar_url || null

          if (!cancelled) {
            setUserInfo({
              email: user.email || undefined,
              displayName,
              avatarUrl: avatarUrl || undefined,
              authProvider,
            })
          }
        } else {
          router.push('/auth/sign-in')
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error in loadUser:', error)
        }
      }
    }
    
    loadUser()
    
    return () => {
      cancelled = true
    }
  }, [supabase, router])

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get session token from Supabase client
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Please sign in again')
        setLoading(false)
        router.push('/auth/sign-in')
        return
      }

      // Use API route with Authorization header
      const response = await fetch('/api/org/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ name: orgName }),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        // If user already belongs to an organization, redirect to dashboard
        if (result.error === 'User already belongs to an organization') {
          router.push('/admin/dashboard')
          router.refresh()
          return
        }
        setError(result.error || 'Failed to create organization')
        setLoading(false)
      } else {
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await redeemInviteCode(inviteCode)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  if (mode === 'select') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Welcome{userInfo?.displayName ? `, ${userInfo.displayName}` : ''}!
            </h2>
            {userInfo?.avatarUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={userInfo.avatarUrl}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full"
                />
              </div>
            )}
            <p className="mt-2 text-center text-gray-600">
              Get started by creating or joining an organization
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              className="w-full"
              size="lg"
            >
              Create New Organization
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Join Existing Organization
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Create Organization
            </h2>
            <p className="mt-2 text-center text-gray-600">
              You'll become the Owner with full permissions
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleCreateOrg}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                name="orgName"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="mt-1"
                placeholder="My Company"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode('select')}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (mode === 'join') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Join Organization
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Enter the invite code provided by your organization admin
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleJoinOrg}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="mt-1"
                placeholder="Enter invite code"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode('select')}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return null
}
