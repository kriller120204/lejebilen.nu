import AdminSidebar from '@/components/AdminSidebar'

export const metadata = { title: 'Admin – Lejebilen.nu' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
