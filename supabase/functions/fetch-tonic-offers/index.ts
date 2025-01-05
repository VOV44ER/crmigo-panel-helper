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
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    console.log('Using token from request:', authHeader)
    
    const response = await fetch(`${TONIC_API_URL}/offers`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch offers:', errorText)
      throw new Error(`Tonic API error: ${response.status} - ${errorText}`)
    }

    // Log the raw response text for debugging
    const responseText = await response.text()
    console.log('Raw API Response:', responseText)

    // Try to parse the response text
    let data
    try {
      data = JSON.parse(responseText)
      console.log('Parsed API Response:', data)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      throw new Error(`Failed to parse Tonic API response: ${parseError.message}`)
    }

    console.log('Successfully fetched offers')
    
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