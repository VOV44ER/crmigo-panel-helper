import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { campaign_id, isFacebook } = await req.json()

    if (!campaign_id) {
      console.error('Missing campaign ID')
      throw new Error('Campaign ID is required')
    }

    console.log('Fetching keywords for campaign:', campaign_id)

    // First, get JWT token from Tonic
    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: !isFacebook ? Deno.env.get('TONIC_CONSUMER_KEY') : Deno.env.get('TONIC_FB_CONSUMER_KEY'),
        consumer_secret: !isFacebook ? Deno.env.get('TONIC_CONSUMER_SECRET') : Deno.env.get('TONIC_FB_CONSUMER_SECRET'),
      }),
    })

    if (!authResponse.ok) {
      const error = await authResponse.text()
      console.error('Tonic API authentication failed:', error)
      throw new Error('Failed to authenticate with Tonic API')
    }

    const { token: tonicToken } = await authResponse.json()
    console.log('Successfully authenticated with Tonic')

    // Fetch campaign keywords from Tonic API
    const response = await fetch(
      `https://api.publisher.tonic.com/privileged/v3/campaign/keywords?campaign_id=${campaign_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${tonicToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Tonic API error:', errorText)
      throw new Error(`Tonic API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched campaign keywords')

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})