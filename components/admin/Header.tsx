'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Bell, Search, Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [orgName, setOrgName] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        // Get profile and org name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, org_id, orgs(name)')
          .eq('id', user.id)
          .single()

        if (profile) {
          setDisplayName(profile.display_name || user.email || '')
          if ((profile as any).orgs) {
            setOrgName((profile as any).orgs.name)
          }
        }
      }
    }
    loadData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Left side - Org name */}
      <div className="flex items-center gap-4">
        {orgName && (
          <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-1.5">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary-700">
              {orgName}
            </span>
          </div>
        )}
      </div>
      
      {/* Right side - User menu */}
      <div className="flex items-center gap-3">
        {/* Search button */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Search className="h-5 w-5" />
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white">
            3
          </span>
        </Button>
        
        {/* Divider */}
        <div className="h-8 w-px bg-border" />
        
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {user.user_metadata?.picture ? (
              <img
                src={user.user_metadata.picture}
                alt="Avatar"
                className="h-9 w-9 rounded-full ring-2 ring-primary/10"
              />
            ) : (
              <div className="avatar avatar-md avatar-primary">
                {getInitials(displayName || user.email || '')}
              </div>
            )}
            
            {/* Name & Email */}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground leading-tight">
                {displayName || 'ผู้ใช้งาน'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        )}
        
        {/* Sign out button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-danger hover:bg-danger-50"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
