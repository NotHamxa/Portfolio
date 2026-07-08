import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getTimelines } from '@/lib/timelineDb'
import { Plus } from 'lucide-react'
import TimelineList from '@/components/admin/TimelineList'

export const dynamic = 'force-dynamic'

export default async function AdminTimelinesPage() {
    const timelines = await getTimelines({ fresh: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Timelines</h1>
                <Button asChild>
                    <Link href="/admin/timelines/new" className="gap-2 flex items-center">
                        <Plus className="w-4 h-4" />
                        New timeline
                    </Link>
                </Button>
            </div>

            <TimelineList timelines={timelines} />
        </div>
    )
}
