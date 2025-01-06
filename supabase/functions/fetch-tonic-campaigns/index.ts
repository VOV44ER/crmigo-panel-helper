import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { states, limit, offset, from, to } = await req.json()
    
    if (!states) {
      throw new Error('Missing required field: states')
    }

    console.log('Fetching campaigns with params:', { states, limit, offset, from, to })

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

    // Get all campaigns from Tonic using the token
    const campaignsUrl = new URL(`${TONIC_API_URL}/campaigns`)
    campaignsUrl.searchParams.append('state', states.join(','))
    campaignsUrl.searchParams.append('stats', 'true')

    console.log('Fetching campaigns from Tonic URL:', campaignsUrl.toString())

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

    const allCampaigns = await campaignsResponse.json()
    console.log('All campaigns from Tonic:', allCampaigns)

    // Apply pagination
    const startIndex = offset || 0
    const endIndex = startIndex + (limit || 10)
    const paginatedCampaigns = allCampaigns.data.slice(startIndex, endIndex)

    const response = {
      data: paginatedCampaigns,
      pagination: {
        total: allCampaigns.data.length,
        offset: startIndex,
        limit: limit || 10
      }
    }

    return new Response(
      JSON.stringify(response),
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