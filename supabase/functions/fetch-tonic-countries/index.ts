import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

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
    console.log('Starting fetch-tonic-countries function...')
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET')
    
    if (!consumerKey || !consumerSecret) {
      console.error('Missing API credentials')
      throw new Error('Missing Tonic API credentials')
    }

    // Create Basic auth token by base64 encoding the credentials
    const credentials = `${consumerKey}:${consumerSecret}`
    const encodedCredentials = base64Encode(new TextEncoder().encode(credentials))
    const token = `Basic ${encodedCredentials}`
    
    console.log('Created authentication token')
    
    const response = await fetch(`${TONIC_API_URL}/countries`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    })

    console.log('Tonic API Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response from Tonic API:', errorText)
      throw new Error(`Tonic API error: ${response.status} - ${errorText}`)
    }

    // Log the raw response text for debugging
    const responseText = await response.text()
    console.log('Raw API Response:', responseText)

    // Try to parse the response text
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      throw new Error(`Failed to parse Tonic API response: ${parseError.message}`)
    }

    console.log('Successfully parsed response')
    
    return new Response(
      JSON.stringify({ data: data.data || [] }),
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