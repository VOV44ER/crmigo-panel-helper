import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const TONIC_API_URL = 'https://api.publisher.tonic.com/v1'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const authText = await authResponse.text()
    console.log('Auth response:', authText)

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authText}`)
    }

    let authData
    try {
      authData = JSON.parse(authText)
    } catch (e) {
      throw new Error(`Failed to parse auth response: ${authText}`)
    }

    if (!authData.token) {
      throw new Error('No token received in auth response')
    }

    console.log('Successfully authenticated with Tonic API')
    console.log('Fetching offers...')

    const response = await fetch(`${TONIC_API_URL}/offers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })

    const responseText = await response.text()
    console.log('Offers response:', responseText)

    if (!response.ok) {
      throw new Error(`Offers fetch failed: ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Failed to parse offers response: ${responseText}`)
    }
    
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