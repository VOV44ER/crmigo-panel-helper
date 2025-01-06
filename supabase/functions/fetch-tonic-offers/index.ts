import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const TONIC_API_URL = 'https://api.publisher.tonic.com/v1'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting Tonic API authentication...')
    
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET')
    
    if (!consumerKey || !consumerSecret) {
      throw new Error('Missing Tonic API credentials')
    }

    const authResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
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

    console.log('Auth response status:', authResponse.status)
    const authText = await authResponse.text()
    console.log('Auth response body:', authText)

    if (!authResponse.ok) {
      throw new Error(`Authentication failed with status ${authResponse.status}: ${authText}`)
    }

    let authData
    try {
      authData = JSON.parse(authText)
    } catch (e) {
      console.error('Failed to parse auth response:', e)
      throw new Error(`Invalid auth response format: ${authText}`)
    }

    if (!authData.token) {
      throw new Error('No token received in auth response')
    }

    console.log('Successfully authenticated with Tonic API')
    console.log('Fetching offers...')

    const offersResponse = await fetch(`${TONIC_API_URL}/offers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    console.log('Offers response status:', offersResponse.status)
    const offersText = await offersResponse.text()
    console.log('Offers response body:', offersText)

    if (!offersResponse.ok) {
      throw new Error(`Offers fetch failed with status ${offersResponse.status}: ${offersText}`)
    }

    let data
    try {
      data = JSON.parse(offersText)
    } catch (e) {
      console.error('Failed to parse offers response:', e)
      throw new Error(`Invalid offers response format: ${offersText}`)
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