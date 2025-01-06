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

    // First, authenticate with Tonic API
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

    // Now fetch countries with the token
    console.log('Fetching countries...')
    const countriesResponse = await fetch(`${TONIC_API_URL}/countries`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!countriesResponse.ok) {
      const errorText = await countriesResponse.text()
      console.error('Countries response error:', errorText)
      throw new Error(`Countries fetch failed with status ${countriesResponse.status}: ${errorText}`)
    }

    const countriesData = await countriesResponse.json()
    console.log('Successfully fetched countries')
    
    return new Response(JSON.stringify(countriesData), { 
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error in fetch-tonic-countries:', error)
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