import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TONIC_API_URL = 'https://api.publisher.tonic.com/v4'

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
    console.log('Starting countries fetch request...')
    
    // Get the Authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization token provided')
    }

    console.log('Fetching countries from Tonic API...')
    const countriesResponse = await fetch(`${TONIC_API_URL}/countries`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
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