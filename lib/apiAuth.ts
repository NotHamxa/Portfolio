import { NextRequest } from 'next/server'

// Shared-secret auth for the programmatic content APIs. The secret is passed as a
// Bearer token (`Authorization: Bearer <secret>`) or an `x-api-key` header, matched
// against the given environment variable. Enables content management without a
// browser session.
export function isApiAuthorized(req: NextRequest, secretEnvVar: string): boolean {
    const secret = process.env[secretEnvVar]
    if (!secret) return false

    const auth = req.headers.get('authorization')
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null
    const apiKey = req.headers.get('x-api-key')?.trim() ?? null

    return bearer === secret || apiKey === secret
}
