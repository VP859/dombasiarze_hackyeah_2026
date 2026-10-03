'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function updateSourceStatusAction(
  sourceId: string,
  sourceType: 'idea' | 'application',
  status: 'approved' | 'rejected'
) {
  const supabaseAdmin = getSupabaseAdmin()

  if (sourceType === 'idea') {
    await supabaseAdmin
      .from('ideas')
      .update({ moderation_status: status })
      .eq('id', sourceId)
  } else {
    await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', sourceId)
  }

  revalidatePath('/admin/moderation')
  return { success: true }
}