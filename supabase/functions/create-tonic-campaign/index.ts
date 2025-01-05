import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const TONIC_API_URL = "https://api.publisher.tonic.com/privileged/v3"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { countryId, offerId, name, targetDomain } = await req.json()

    if (!countryId || !offerId || !name) {
      throw new Error('Missing required fields')
    }

    const params = new URLSearchParams({
      country_id: countryId,
      offer_id: offerId.toString(),
      name,
      ...(targetDomain && { target_domain: targetDomain }),
    })

    const response = await fetch(`${TONIC_API_URL}/campaigns/create?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('TONIC_CONSUMER_KEY')}:${Deno.env.get('TONIC_CONSUMER_SECRET')}`)}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to create campaign: ${await response.text()}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})