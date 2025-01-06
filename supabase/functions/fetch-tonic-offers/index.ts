import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TONIC_API_URL = 'https://api.publisher.tonic.com/v1'

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
    console.log('Starting Tonic API authentication...')
    
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET')
    
    if (!consumerKey || !consumerSecret) {
      throw new Error('Missing Tonic API credentials')
    }

    console.log('Authenticating with Tonic API...')
    const authResponse = await fetch(`${TONIC_API_URL}/jwt/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error('Auth response error:', errorText)
      throw new Error(`Authentication failed with status ${authResponse.status}: ${errorText}`)
    }

    const authData = await authResponse.json()
    console.log('Successfully authenticated with Tonic API')

    if (!authData.token) {
      throw new Error('No token received in auth response')
    }

    console.log('Fetching offers...')
    const offersResponse = await fetch(`${TONIC_API_URL}/offers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!offersResponse.ok) {
      const errorText = await offersResponse.text()
      console.error('Offers response error:', errorText)
      throw new Error(`Offers fetch failed with status ${offersResponse.status}: ${errorText}`)
    }

    const offersData = await offersResponse.json()
    console.log('Successfully fetched offers')
    
    return new Response(JSON.stringify(offersData), { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error in fetch-tonic-offers:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
})