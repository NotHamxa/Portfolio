import { MongoClient, Collection } from 'mongodb'

const globalWithMongo = global as typeof global & { _mongoClient?: MongoClient }

async function getCollection(): Promise<Collection | null> {
    const uri = process.env.MONGODB_URI
    if (!uri) return null

    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(uri)
        await globalWithMongo._mongoClient.connect()
    }

    return globalWithMongo._mongoClient.db('Portfolio').collection('telemetry')
}

export interface TelemetryEvent {
    projectName: string
    deviceId: string
    event: string
    detail?: string
    timestamp: string
}

export interface ProjectStats {
    projectName: string
    total: number
    uniqueDevices: number
    events: { name: string; count: number }[]
    lastEventAt: string | null
}

export async function recordEvent(e: Omit<TelemetryEvent, 'timestamp'>): Promise<void> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')
    await col.insertOne({ ...e, timestamp: new Date() })
}

export async function getEvents(projectName?: string, limit = 500): Promise<TelemetryEvent[]> {
    const col = await getCollection()
    if (!col) return []
    const filter = projectName ? { projectName } : {}
    const docs = await col.find(filter).sort({ timestamp: -1 }).limit(limit).toArray()
    return docs.map(d => ({
        projectName: d.projectName,
        deviceId: d.deviceId,
        event: d.event,
        detail: d.detail,
        timestamp: (d.timestamp instanceof Date ? d.timestamp : new Date(d.timestamp)).toISOString(),
    }))
}

export async function getProjectStats(): Promise<ProjectStats[]> {
    const col = await getCollection()
    if (!col) return []
    const docs = await col.find({}).toArray()

    const map = new Map<string, { devices: Set<string>; events: Map<string, number>; total: number; last: Date | null }>()
    for (const d of docs) {
        const p = d.projectName as string
        if (!p) continue
        let entry = map.get(p)
        if (!entry) {
            entry = { devices: new Set(), events: new Map(), total: 0, last: null }
            map.set(p, entry)
        }
        entry.total++
        if (d.deviceId) entry.devices.add(d.deviceId)
        if (d.event) entry.events.set(d.event, (entry.events.get(d.event) || 0) + 1)
        const ts = d.timestamp instanceof Date ? d.timestamp : new Date(d.timestamp)
        if (!entry.last || ts > entry.last) entry.last = ts
    }

    return [...map.entries()]
        .map(([projectName, v]) => ({
            projectName,
            total: v.total,
            uniqueDevices: v.devices.size,
            events: [...v.events.entries()]
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count),
            lastEventAt: v.last ? v.last.toISOString() : null,
        }))
        .sort((a, b) => b.total - a.total)
}
