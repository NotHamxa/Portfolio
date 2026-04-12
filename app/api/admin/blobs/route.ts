import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { list, del, copy, put } from '@vercel/blob'

async function requireAdmin(): Promise<boolean> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    return session.isAdmin === true
}

export async function GET(req: NextRequest) {
    if (!await requireAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prefix = req.nextUrl.searchParams.get('prefix') || undefined

    const result = await list({ prefix, limit: 1000 })

    return NextResponse.json({
        blobs: result.blobs.map(b => ({
            url: b.url,
            pathname: b.pathname,
            size: b.size,
            uploadedAt: b.uploadedAt,
        })),
    })
}

export async function DELETE(req: NextRequest) {
    if (!await requireAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await req.json()
    if (!url) {
        return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    await del(url)
    return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
    if (!await requireAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { folder } = await req.json()
    if (!folder || typeof folder !== 'string') {
        return NextResponse.json({ error: 'Missing folder name' }, { status: 400 })
    }

    const cleaned = folder.replace(/[^a-zA-Z0-9_\-\/]/g, '').replace(/\/+/g, '/')
    if (!cleaned) {
        return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 })
    }

    // Vercel Blob has no real folders — upload a tiny placeholder to create one
    const placeholder = new Uint8Array([0])
    await put(`${cleaned}/.folder`, placeholder, {
        access: 'public',
        addRandomSuffix: false,
    })

    return NextResponse.json({ success: true, folder: cleaned })
}

export async function PATCH(req: NextRequest) {
    if (!await requireAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sourceUrl, newPathname } = await req.json()
    if (!sourceUrl || !newPathname) {
        return NextResponse.json({ error: 'Missing sourceUrl or newPathname' }, { status: 400 })
    }

    const newBlob = await copy(sourceUrl, newPathname, { access: 'public' })
    await del(sourceUrl)

    return NextResponse.json({
        url: newBlob.url,
        pathname: newBlob.pathname,
    })
}
