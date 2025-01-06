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
    const { from, to, username } = await req.json()

    // Enhanced validation
    if (!from || !to) {
      console.error('Missing date range parameters')
      throw new Error('Date range is required')
    }

    console.log('Processing request for date range:', { from, to, username })

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
    console.log('Successfully authenticated with Tonic')

    // Build the URL with query parameters
    const url = new URL('https://api.publisher.tonic.com/v4/statistics/keywords')
    url.searchParams.set('from', from)
    url.searchParams.set('to', to)
    url.searchParams.set('orderField', 'clicks')
    url.searchParams.set('orderOrientation', 'desc')
    url.searchParams.set('offset', '0')
    if (username) {
      url.searchParams.set('campaignName', username)
    }

    console.log('Fetching keywords from URL:', url.toString())

    // Fetch keywords from Tonic API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${tonicToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Tonic API error:', errorText)
      throw new Error(`Failed to fetch keywords stats: ${errorText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched keywords statistics')

    return new Response(
      JSON.stringify(data),
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