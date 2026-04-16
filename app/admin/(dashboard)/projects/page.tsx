import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getProjects } from '@/lib/db'
import { Plus } from 'lucide-react'
import ProjectList from '@/components/admin/ProjectList'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
    const projects = await getProjects({ fresh: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Projects</h1>
                <Button asChild>
                    <Link href="/admin/projects/new" className="gap-2 flex items-center">
                        <Plus className="w-4 h-4" />
                        New project
                    </Link>
                </Button>
            </div>

            <ProjectList projects={projects} />
        </div>
    )
}
