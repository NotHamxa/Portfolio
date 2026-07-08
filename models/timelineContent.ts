export interface TimelineEntry {
    date: string
    note: string
}

export interface TimelineType {
    id: string
    title: string
    entries: TimelineEntry[]
    show: boolean
}
