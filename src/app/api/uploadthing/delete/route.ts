import { UTApi } from "uploadthing/server"
import { NextResponse } from 'next/server'

const utapi = new UTApi()

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json()
    const fileKey = url.split('/').pop()
    
    await utapi.deleteFiles(fileKey)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
} 