import { NextRequest } from 'next/server'

// Shared-secret auth for the programmatic timeline API. The secret is passed as a
// Bearer token (`Authorization: Bearer <secret>`) or an `x-api-key` header, matched
// against TIMELINE_API_SECRET. Lets an automated agent (e.g. Claude) manage timelines.
export function isTimelineApiAuthorized(req: NextRequest): boolean {
    const secret = process.env.TIMELINE_API_SECRET
    if (!secret) return false

    const auth = req.headers.get('authorization')
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null
    const apiKey = req.headers.get('x-api-key')?.trim() ?? null

    return bearer === secret || apiKey === secret
}
