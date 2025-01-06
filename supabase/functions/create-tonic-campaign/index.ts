import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TONIC_API_URL = "https://api.publisher.tonic.com/privileged/v3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { countryId, offerId, name, targetDomain, userId } = await req.json()
    
    if (!countryId || !offerId || !name || !userId) {
      throw new Error('Missing required fields')
    }

    console.log('Creating campaign with params:', { countryId, offerId, name, targetDomain })

    // Create Supabase client to fetch user profile
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch user's profile to get username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    const username = profile.username || 'unknown'
    const campaignName = `${username}-${name}`
    console.log('Generated campaign name:', campaignName)

    // First, get JWT token from Tonic
    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: Deno.env.get('TONIC_CONSUMER_KEY'),
        consumer_secret: Deno.env.get('TONIC_CONSUMER_SECRET'),
      }),
    })

    if (!authResponse.ok) {
      const error = await authResponse.text()
      console.error('Tonic API authentication failed:', error)
      throw new Error('Failed to authenticate with Tonic API')
    }

    const { token: tonicToken } = await authResponse.json()
    console.log('Successfully obtained Tonic JWT token')
    
    // Create campaign in Tonic
    const tonicUrl = new URL(`${TONIC_API_URL}/campaign/create`)
    tonicUrl.searchParams.append('name', campaignName)
    tonicUrl.searchParams.append('offer_id', offerId.toString())
    tonicUrl.searchParams.append('country', countryId)
    if (targetDomain) {
      tonicUrl.searchParams.append('domain', targetDomain)
    }

    console.log('Creating campaign in Tonic with URL:', tonicUrl.toString())

    const response = await fetch(tonicUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tonicToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log('Raw Tonic API response:', responseText)

    if (!response.ok) {
      console.error('Tonic API error. Status:', response.status, 'Response:', responseText)
      throw new Error(`Failed to create campaign: ${responseText}`)
    }

    let campaign
    try {
      campaign = JSON.parse(responseText)
      console.log('Parsed Tonic API response:', campaign)
    } catch (e) {
      console.error('Failed to parse Tonic API response:', e)
      throw new Error('Invalid response from Tonic API')
    }

    console.log('Campaign created in Tonic:', campaign)
    console.log('Campaign data structure:', {
      id: campaign.data?.id,
      fullData: campaign
    })

    // Store campaign in Supabase with userId
    const { error: dbError } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        campaign_id: campaign.data?.id?.toString(),
        name: campaignName,
        offer_id: parseInt(offerId),
        country_id: countryId,
        target_domain: targetDomain
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to store campaign in database: ${dbError.message}`)
    }

    return new Response(
      JSON.stringify(campaign),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})