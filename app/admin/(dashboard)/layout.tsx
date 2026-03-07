import { redirect } from 'next/navigation'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import AdminNav from '@/components/admin/AdminNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    if (!session.isAdmin) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />
            <main className="max-w-5xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    )
}
