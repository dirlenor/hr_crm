import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background scrollbar-custom">
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
