import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const TONIC_API_URL = 'https://api.publisher.tonic.com/v1'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // First authenticate with Tonic API
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
      throw new Error(`Authentication failed: ${await authResponse.text()}`)
    }

    const { token } = await authResponse.json()

    // Then fetch offers with the obtained token
    const response = await fetch(`${TONIC_API_URL}/offers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })

    if (!response.ok) {
      throw new Error(`Offers fetch failed: ${await response.text()}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
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