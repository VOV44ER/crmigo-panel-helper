import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const TONIC_API_URL = "https://api.publisher.tonic.com/v4"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Fetching countries from Tonic API v4...')
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET')
    
    if (!consumerKey || !consumerSecret) {
      throw new Error('Missing Tonic API credentials')
    }

    // Create Bearer token from credentials
    const credentials = btoa(`${consumerKey}:${consumerSecret}`)
    console.log('Credentials encoded successfully')
    
    const response = await fetch(`${TONIC_API_URL}/countries`, {
      headers: {
        'Authorization': `Bearer ${credentials}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch countries:', errorText)
      throw new Error(`Failed to fetch countries: ${errorText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched countries')
    
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
    console.error('Error in fetch-tonic-countries:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      },
    )
  }
})