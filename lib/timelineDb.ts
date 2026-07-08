import { MongoClient, Collection } from 'mongodb'
import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache'
import { TimelineType, TimelineEntry } from '@/models/timelineContent'

// --- MongoDB client singleton (shared with lib/db.ts) ---
const globalWithMongo = global as typeof global & { _mongoClient?: MongoClient }

async function getCollection(): Promise<Collection | null> {
    const uri = process.env.MONGODB_URI
    if (!uri) return null

    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(uri)
        await globalWithMongo._mongoClient.connect()
    }

    return globalWithMongo._mongoClient.db('Portfolio').collection('timelines')
}

function toTimeline(doc: Record<string, unknown>): TimelineType {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = doc
    return rest as TimelineType
}

// --- Cached read path ---
async function fetchTimelinesFromDb(): Promise<TimelineType[]> {
    const col = await getCollection()
    if (!col) return []

    const docs = await col.find({}).toArray()
    return docs.map(toTimeline)
}

const getCachedTimelines = unstable_cache(
    fetchTimelinesFromDb,
    ['timelines-list'],
    { tags: ['timelines'], revalidate: 3600 }
)

function invalidateTimelines() {
    revalidateTag('timelines', 'default')
    revalidatePath('/timeline/[slug]', 'page')
}

export async function getTimelines({ fresh = false }: { fresh?: boolean } = {}): Promise<TimelineType[]> {
    return fresh ? fetchTimelinesFromDb() : getCachedTimelines()
}

export async function getTimeline(slug: string, opts?: { fresh?: boolean }): Promise<TimelineType | null> {
    const timelines = await getTimelines(opts)
    return timelines.find(t => t.id === slug || t.title.toLowerCase() === slug) ?? null
}

export async function createTimeline(data: Omit<TimelineType, 'id'>): Promise<TimelineType> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    const id = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const timeline: TimelineType = { show: true, ...data, id }
    await col.insertOne(timeline as Record<string, unknown>)
    invalidateTimelines()
    return timeline
}

export async function updateTimeline(id: string, updates: Partial<Omit<TimelineType, 'id'>>): Promise<TimelineType | null> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    const existing = await col.findOne({ id })
    if (!existing) return null

    const updated = { ...toTimeline(existing), ...updates }
    await col.replaceOne({ id }, updated as Record<string, unknown>)
    invalidateTimelines()
    return updated
}

export async function addTimelineEntry(id: string, entry: TimelineEntry): Promise<TimelineType | null> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    const existing = await col.findOne({ id })
    if (!existing) return null

    const timeline = toTimeline(existing)
    const updated: TimelineType = { ...timeline, entries: [...(timeline.entries ?? []), entry] }
    await col.replaceOne({ id }, updated as Record<string, unknown>)
    invalidateTimelines()
    return updated
}

export async function deleteTimeline(id: string): Promise<boolean> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    const result = await col.deleteOne({ id })
    if (result.deletedCount === 0) return false
    invalidateTimelines()
    return true
}

export async function saveTimelines(timelines: TimelineType[]): Promise<void> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    await col.deleteMany({})
    if (timelines.length > 0) {
        await col.insertMany(timelines as Record<string, unknown>[])
    }
    invalidateTimelines()
}

export async function reorderTimelines(ids: string[]): Promise<void> {
    const timelines = await fetchTimelinesFromDb()
    const map = new Map(timelines.map(t => [t.id, t]))
    const reordered = ids.map(id => map.get(id)).filter(Boolean) as TimelineType[]
    await saveTimelines(reordered)
}
