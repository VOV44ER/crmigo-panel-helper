import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const TONIC_API_URL = "https://api.publisher.tonic.com/privileged/v3"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Fetching countries from Tonic API...')
    
    const response = await fetch(`${TONIC_API_URL}/countries/list?output=json`, {
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('TONIC_CONSUMER_KEY')}:${Deno.env.get('TONIC_CONSUMER_SECRET')}`)}`,
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