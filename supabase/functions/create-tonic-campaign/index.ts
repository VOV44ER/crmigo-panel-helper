import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TONIC_API_URL = "https://api.publisher.tonic.com/privileged/v3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { countryId, offerId, name, targetDomain, userId } = await req.json()
    
    if (!countryId || !offerId || !name || !userId) {
      throw new Error('Missing required fields: countryId, offerId, name, and userId are required')
    }

    // Get authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    const tonicToken = authHeader.replace('Bearer ', '')
    console.log('Using Tonic token:', tonicToken)
    
    // Create campaign in Tonic
    const response = await fetch(`${TONIC_API_URL}/campaigns/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tonicToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        country_id: countryId,
        offer_id: offerId,
        name,
        ...(targetDomain ? { target_domain: targetDomain } : {})
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Tonic API error:', errorText)
      throw new Error(`Failed to create campaign: ${errorText}`)
    }

    const campaignData = await response.json()
    console.log('Campaign created in Tonic:', campaignData)

    // Store campaign in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: supabaseError } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        campaign_id: campaignData.data.id.toString(),
        name,
        offer_id: offerId,
        country_id: countryId,
        target_domain: targetDomain
      })

    if (supabaseError) {
      throw new Error(`Failed to store campaign in database: ${supabaseError.message}`)
    }
    
    return new Response(
      JSON.stringify(campaignData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      },
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
        },
      },
    )
  }
})