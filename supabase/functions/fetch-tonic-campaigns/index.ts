import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TONIC_API_URL = "https://api.publisher.tonic.com/v4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { states, limit, offset, from, to, username } = await req.json()
    
    console.log('Received request params:', { states, limit, offset, from, to, username })

    // First, get JWT token from Tonic
    console.log('Authenticating with Tonic API...')
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
      throw new Error(`Authentication failed: ${error}`)
    }

    const { token: tonicToken } = await authResponse.json()
    console.log('Successfully obtained Tonic JWT token')

    // Build the campaigns URL with query parameters
    const campaignsUrl = new URL(`${TONIC_API_URL}/campaigns`)
    campaignsUrl.searchParams.append('state', states.join(','))
    campaignsUrl.searchParams.append('stats', 'true')
    if (limit) campaignsUrl.searchParams.append('limit', limit.toString())
    if (offset) campaignsUrl.searchParams.append('offset', offset.toString())
    
    // Only add date parameters if both from and to are provided
    if (from && to) {
      campaignsUrl.searchParams.append('from', from)
      campaignsUrl.searchParams.append('to', to)
    }
    
    if (username) campaignsUrl.searchParams.append('campaignName', username)

    console.log('Fetching campaigns from URL:', campaignsUrl.toString())

    const campaignsResponse = await fetch(campaignsUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tonicToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!campaignsResponse.ok) {
      const errorText = await campaignsResponse.text()
      console.error('Tonic API error:', errorText)
      throw new Error(`Failed to fetch campaigns: ${errorText}`)
    }

    const campaigns = await campaignsResponse.json()
    console.log('Successfully fetched campaigns')

    return new Response(
      JSON.stringify(campaigns),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in fetch-tonic-campaigns:', error)
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