import TimelineForm from '@/components/admin/TimelineForm'

export default function NewTimelinePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">New timeline</h1>
                <p className="text-sm text-muted-foreground mt-1">The project name will become the URL slug (lowercased).</p>
            </div>
            <TimelineForm mode="create" />
        </div>
    )
}
