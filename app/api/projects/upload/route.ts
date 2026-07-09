import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { isApiAuthorized } from '@/lib/apiAuth'

// Upload an image to Vercel Blob and return its public URL, for use as a project
// logo or in <img>/<imgText> content. Auth: Bearer PROJECT_API_SECRET (or x-api-key).
// Send multipart/form-data with a `file` field (and optional `folder`, default "images").
export async function POST(req: NextRequest) {
    if (!isApiAuthorized(req, 'PROJECT_API_SECRET')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'images'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'File must be an image' }, { status: 400 })

    const filename = `${folder}/${Date.now()}-${file.name}`
    const blob = await put(filename, file, { access: 'public', addRandomSuffix: false })

    return NextResponse.json({ url: blob.url })
}
