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
    console.log('Starting Tonic API request...')
    
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET')
    
    if (!consumerKey || !consumerSecret) {
      console.error('Missing API credentials')
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

    const authResponseText = await authResponse.text()
    console.log('Auth response status:', authResponse.status)
    console.log('Auth response:', authResponseText)

    if (!authResponse.ok) {
      throw new Error(`Authentication failed with status ${authResponse.status}: ${authResponseText}`)
    }

    let authData
    try {
      authData = JSON.parse(authResponseText)
    } catch (e) {
      console.error('Failed to parse auth response:', e)
      throw new Error(`Invalid auth response format: ${authResponseText}`)
    }

    if (!authData.token) {
      console.error('No token in response:', authData)
      throw new Error('No token received in auth response')
    }

    console.log('Successfully authenticated, fetching countries...')
    const countriesResponse = await fetch(`${TONIC_API_URL}/countries`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    const countriesResponseText = await countriesResponse.text()
    console.log('Countries response status:', countriesResponse.status)
    console.log('Countries response:', countriesResponseText)

    if (!countriesResponse.ok) {
      throw new Error(`Countries fetch failed with status ${countriesResponse.status}: ${countriesResponseText}`)
    }

    let countriesData
    try {
      countriesData = JSON.parse(countriesResponseText)
    } catch (e) {
      console.error('Failed to parse countries response:', e)
      throw new Error(`Invalid countries response format: ${countriesResponseText}`)
    }

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