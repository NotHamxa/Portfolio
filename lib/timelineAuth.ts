import { NextRequest } from 'next/server'
import { isApiAuthorized } from './apiAuth'

// Auth for the programmatic timeline API. Secret lives in the TIMELINE_API_SECRET
// environment variable (set on the host and in Vercel).
export function isTimelineApiAuthorized(req: NextRequest): boolean {
    return isApiAuthorized(req, 'TIMELINE_API_SECRET')
}
