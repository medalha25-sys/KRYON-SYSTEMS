import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function LegacyPublicSchedulingPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params

  if (!slug) {
    return notFound()
  }

  const supabase = await createClient()

  // 1. Check if slug matches an organization slug
  const { data: orgBySlug } = await supabase
    .from('organizations')
    .select('id, slug, public_booking_enabled')
    .eq('slug', slug)
    .maybeSingle()

  if (orgBySlug?.slug) {
    redirect(`/book/${orgBySlug.slug}`)
  }

  // 2. Check if slug is an organization UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  if (isUuid) {
    const { data: orgById } = await supabase
      .from('organizations')
      .select('id, slug')
      .eq('id', slug)
      .maybeSingle()

    if (orgById?.slug) {
      redirect(`/book/${orgById.slug}`)
    }

    // 3. Check if slug is a profile ID with linked organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, organizations(slug)')
      .eq('id', slug)
      .maybeSingle()

    const profileOrgSlug = (profile?.organizations as any)?.slug
    if (profileOrgSlug) {
      redirect(`/book/${profileOrgSlug}`)
    }

    // 4. Check if slug is a legacy shop ID with linked organization
    const { data: shop } = await supabase
      .from('shops')
      .select('organization_id, organizations(slug)')
      .eq('id', slug)
      .maybeSingle()

    const shopOrgSlug = (shop?.organizations as any)?.slug
    if (shopOrgSlug) {
      redirect(`/book/${shopOrgSlug}`)
    }
  }

  // If no matching active organization was found, return 404
  return notFound()
}

