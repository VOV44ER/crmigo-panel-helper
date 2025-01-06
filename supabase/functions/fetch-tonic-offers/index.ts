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
    console.log('Starting offers fetch request...')
    
    // Get the Authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization token provided')
    }

    console.log('Fetching offers from Tonic API...')
    const offersResponse = await fetch(`${TONIC_API_URL}/offers`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    const offersResponseText = await offersResponse.text()
    console.log('Offers response status:', offersResponse.status)
    console.log('Offers response:', offersResponseText)

    if (!offersResponse.ok) {
      throw new Error(`Offers fetch failed with status ${offersResponse.status}: ${offersResponseText}`)
    }

    let offersData
    try {
      offersData = JSON.parse(offersResponseText)
    } catch (e) {
      console.error('Failed to parse offers response:', e)
      throw new Error(`Invalid offers response format: ${offersResponseText}`)
    }

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