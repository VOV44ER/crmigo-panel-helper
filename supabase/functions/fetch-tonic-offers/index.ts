import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TONIC_API_URL = "https://api.publisher.tonic.com/v4"

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
    // First, authenticate with Tonic API to get JWT token
    console.log('Authenticating with Tonic API...')
    
    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    const { token } = await authResponse.json()
    console.log('Successfully obtained Tonic JWT token')

    // Now fetch offers using the JWT token
    console.log('Fetching offers from Tonic API...')
    
    const response = await fetch(`${TONIC_API_URL}/offers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch offers:', errorText)
      throw new Error(`Tonic API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched offers:', data)
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      },
    )
  }
})