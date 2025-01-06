import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TONIC_API_URL = "https://api.publisher.tonic.com/v4"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { from, to, username } = await req.json()
    
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
    
    // Build the URL with all required query parameters
    const url = new URL(`${TONIC_API_URL}/statistics/keywords`)
    url.searchParams.append('from', from)
    url.searchParams.append('to', to)
    url.searchParams.append('orderField', 'clicks')
    url.searchParams.append('orderOrientation', 'desc')
    url.searchParams.append('offset', '0')
    if (username) url.searchParams.append('campaignName', username)

    console.log('Fetching keywords with URL:', url.toString())

    // Fetch keywords stats from Tonic
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${tonicToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Tonic API error:', error)
      throw new Error(`Failed to fetch keywords stats: ${error}`)
    }

    const result = await response.json()
    console.log('Successfully fetched keywords stats:', result)

    return new Response(
      JSON.stringify(result),
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