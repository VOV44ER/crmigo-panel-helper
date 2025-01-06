import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { campaign_id } = await req.json()

    if (!campaign_id) {
      throw new Error('Campaign ID is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the user's token from Tonic
    const { data: { access_token }, error: tokenError } = await supabase
      .functions.invoke('authenticate-tonic')

    if (tokenError || !access_token) {
      console.error('Error getting Tonic token:', tokenError)
      throw new Error('Failed to authenticate with Tonic')
    }

    // Fetch keywords from Tonic API
    const response = await fetch(
      `https://api.publisher.tonic.com/privileged/v3/campaign/keywords?campaign_id=${campaign_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Tonic API error:', await response.text())
      throw new Error(`Tonic API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Successfully fetched keywords for campaign:', campaign_id)

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
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})