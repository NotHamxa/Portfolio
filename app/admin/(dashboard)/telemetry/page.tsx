"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, RefreshCw, Search, BarChart3, Smartphone } from 'lucide-react'

interface ProjectStats {
    projectName: string
    total: number
    uniqueDevices: number
    events: { name: string; count: number }[]
    lastEventAt: string | null
}

interface TelemetryEvent {
    projectName: string
    deviceId: string
    event: string
    detail?: string
    timestamp: string
}

function formatTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString()
}

export default function TelemetryPage() {
    const [stats, setStats] = useState<ProjectStats[]>([])
    const [events, setEvents] = useState<TelemetryEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const fetchData = useCallback(async (project?: string | null) => {
        setLoading(true)
        try {
            const url = project
                ? `/api/admin/telemetry?project=${encodeURIComponent(project)}`
                : '/api/admin/telemetry'
            const res = await fetch(url)
            const data = await res.json()
            setStats(data.stats || [])
            setEvents(data.events || [])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData(selected) }, [fetchData, selected])

    const filteredEvents = search
        ? events.filter(e => {
            const q = search.toLowerCase()
            return (
                e.deviceId.toLowerCase().includes(q) ||
                e.event.toLowerCase().includes(q) ||
                (e.detail || '').toLowerCase().includes(q) ||
                e.projectName.toLowerCase().includes(q)
            )
        })
        : events

    const totalEvents = stats.reduce((a, s) => a + s.total, 0)
    const totalDevices = new Set(events.map(e => e.deviceId)).size

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Telemetry</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {totalEvents} events across {stats.length} projects
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(selected)}
                    disabled={loading}
                    className="gap-1.5"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Refresh
                </Button>
            </div>

            {/* Project tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        selected === null
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border hover:bg-muted/50'
                    }`}
                >
                    All ({totalEvents})
                </button>
                {stats.map(s => (
                    <button
                        key={s.projectName}
                        type="button"
                        onClick={() => setSelected(s.projectName)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                            selected === s.projectName
                                ? 'bg-foreground text-background border-foreground'
                                : 'border-border hover:bg-muted/50'
                        }`}
                    >
                        {s.projectName} ({s.total})
                    </button>
                ))}
            </div>

            {/* Stats cards */}
            {selected ? (
                (() => {
                    const s = stats.find(x => x.projectName === selected)
                    if (!s) return (
                        <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
                            No data for &quot;{selected}&quot;
                        </div>
                    )
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-lg border border-border p-4">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    Total events
                                </div>
                                <div className="text-2xl font-semibold mt-2">{s.total}</div>
                            </div>
                            <div className="rounded-lg border border-border p-4">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                                    <Smartphone className="w-3.5 h-3.5" />
                                    Unique devices
                                </div>
                                <div className="text-2xl font-semibold mt-2">{s.uniqueDevices}</div>
                            </div>
                            <div className="rounded-lg border border-border p-4">
                                <div className="text-xs text-muted-foreground uppercase tracking-wide">Last event</div>
                                <div className="text-sm font-medium mt-2">
                                    {s.lastEventAt ? formatTime(s.lastEventAt) : '—'}
                                </div>
                            </div>
                            <div className="rounded-lg border border-border p-4 md:col-span-3">
                                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Event breakdown</div>
                                <div className="flex flex-wrap gap-2">
                                    {s.events.map(e => (
                                        <span key={e.name} className="text-sm px-2.5 py-1 rounded-md bg-muted">
                                            <span className="font-medium">{e.name}</span>
                                            <span className="text-muted-foreground ml-1.5">{e.count}</span>
                                        </span>
                                    ))}
                                    {s.events.length === 0 && (
                                        <span className="text-sm text-muted-foreground">No events</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })()
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border p-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Projects</div>
                        <div className="text-2xl font-semibold mt-2">{stats.length}</div>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Total events</div>
                        <div className="text-2xl font-semibold mt-2">{totalEvents}</div>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Devices (recent)</div>
                        <div className="text-2xl font-semibold mt-2">{totalDevices}</div>
                    </div>
                </div>
            )}

            {/* Events table */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Recent events</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Filter events..."
                            className="h-8 pl-8 text-sm"
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                    {loading && events.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            {events.length === 0 ? 'No telemetry events yet' : 'No events match your filter'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="text-left font-medium px-4 py-2.5">Time</th>
                                        {!selected && <th className="text-left font-medium px-4 py-2.5">Project</th>}
                                        <th className="text-left font-medium px-4 py-2.5">Event</th>
                                        <th className="text-left font-medium px-4 py-2.5">Device</th>
                                        <th className="text-left font-medium px-4 py-2.5">Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEvents.map((e, i) => (
                                        <tr key={i} className="border-t border-border hover:bg-muted/30">
                                            <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">{formatTime(e.timestamp)}</td>
                                            {!selected && <td className="px-4 py-2 font-medium">{e.projectName}</td>}
                                            <td className="px-4 py-2">
                                                <span className="px-2 py-0.5 rounded bg-muted text-xs font-medium">{e.event}</span>
                                            </td>
                                            <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{e.deviceId}</td>
                                            <td className="px-4 py-2 text-muted-foreground max-w-md truncate" title={e.detail || ''}>
                                                {e.detail || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
