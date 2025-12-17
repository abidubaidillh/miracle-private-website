// frontend/lib/uploadService.ts
import { createClient } from '@supabase/supabase-js'

// Pastikan variabel ini ada di .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const uploadProof = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `gaji/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('finance-proofs') // Pastikan nama bucket sesuai
    .upload(filePath, file)

  if (uploadError) {
    throw new Error('Gagal upload gambar: ' + uploadError.message)
  }

  const { data } = supabase.storage
    .from('finance-proofs')
    .getPublicUrl(filePath)

  return data.publicUrl
}