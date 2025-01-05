import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const TONIC_API_URL = "https://api.publisher.tonic.com/privileged/v3"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const response = await fetch(`${TONIC_API_URL}/offers/list?output=json`, {
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('TONIC_CONSUMER_KEY')}:${Deno.env.get('TONIC_CONSUMER_SECRET')}`)}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch offers: ${await response.text()}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})