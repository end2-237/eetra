import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
}

const supabaseAdmin = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const templateId = formData.get('templateId') as string | null

  if (!file || !templateId) {
    return NextResponse.json({ error: 'Fichier ou templateId manquant' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const path = `template-previews/${session.user.id}/${templateId}.jpg`

  const { error } = await supabaseAdmin.storage
    .from('images') // ton bucket
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: true, // écrase si existe déjà
    })

  if (error) {
    console.error('[upload-preview]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage
    .from('images')
    .getPublicUrl(path)

  return NextResponse.json({ publicUrl: data.publicUrl })
}
