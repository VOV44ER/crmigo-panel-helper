import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TONIC_API_URL = "https://api.publisher.tonic.com/v3"

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
    
    // Create campaign in Tonic (without userId)
    const response = await fetch(`${TONIC_API_URL}/campaigns`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tonicToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        country_id: countryId,
        offer_id: offerId,
        name: name,
        target_domain: targetDomain
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Tonic API error:', errorText)
      throw new Error(`Failed to create campaign: ${errorText}`)
    }

    const campaign = await response.json()
    console.log('Campaign created in Tonic:', campaign)

    // Store campaign in Supabase with userId
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: dbError } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        campaign_id: campaign.data.id.toString(),
        name: name,
        offer_id: offerId,
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