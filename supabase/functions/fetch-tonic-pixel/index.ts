import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campaign_id } = await req.json()

    // First, authenticate with Tonic
    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: Deno.env.get('TONIC_CONSUMER_KEY'),
        consumer_secret: Deno.env.get('TONIC_CONSUMER_SECRET'),
      }),
    })

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Tonic API')
    }

    const { token } = await authResponse.json()

    // Fetch pixel configuration
    const pixelResponse = await fetch(`https://api.publisher.tonic.com/privileged/v3/campaign/pixel?campaign_id=${campaign_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!pixelResponse.ok) {
      throw new Error('Failed to fetch pixel configuration')
    }

    const pixelData = await pixelResponse.json()
    console.log('Pixel data:', pixelData)

    return new Response(
      JSON.stringify(pixelData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})