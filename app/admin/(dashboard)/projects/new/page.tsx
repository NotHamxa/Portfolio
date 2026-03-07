import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">New project</h1>
                <p className="text-sm text-muted-foreground mt-1">The title will become the URL slug (lowercased).</p>
            </div>
            <ProjectForm mode="create" />
        </div>
    )
}
