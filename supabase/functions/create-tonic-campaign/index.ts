import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const TONIC_API_URL = "https://api.publisher.tonic.com/privileged/v3"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { countryId, offerId, name, targetDomain } = await req.json()
    
    if (!countryId || !offerId || !name) {
      throw new Error('Missing required fields: countryId, offerId, and name are required')
    }

    console.log('Creating campaign with:', { countryId, offerId, name, targetDomain })
    
    const payload = {
      country_id: countryId,
      offer_id: offerId,
      name,
      ...(targetDomain ? { target_domain: targetDomain } : {})
    }

    const response = await fetch(`${TONIC_API_URL}/campaigns/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('TONIC_CONSUMER_KEY')}:${Deno.env.get('TONIC_CONSUMER_SECRET')}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to create campaign:', errorText)
      throw new Error(`Failed to create campaign: ${errorText}`)
    }

    const data = await response.json()
    console.log('Successfully created campaign')
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      },
    )
  } catch (error) {
    console.error('Error in create-tonic-campaign:', error.message)
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