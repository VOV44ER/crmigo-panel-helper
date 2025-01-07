import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id, pixel_id, access_token, event_name, revenue_type } = await req.json();

    console.log('Received request with params:', { campaign_id, pixel_id, access_token, event_name, revenue_type });

    // First authenticate with Tonic API
    const authResponse = await fetch('https://api.publisher.tonic.com/privileged/auth', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: Deno.env.get('TONIC_CONSUMER_KEY'),
        consumer_secret: Deno.env.get('TONIC_CONSUMER_SECRET'),
      }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Tonic API authentication failed. Status:', authResponse.status, 'Response:', errorText);
      throw new Error(`Failed to authenticate with Tonic API: ${errorText}`);
    }

    const authData = await authResponse.json();
    if (!authData.token) {
      console.error('No token in auth response:', authData);
      throw new Error('No token received from Tonic API');
    }

    // Save pixel configuration
    const response = await fetch('https://api.publisher.tonic.com/privileged/v3/campaign/pixel/tiktok', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`,
      },
      body: JSON.stringify({
        campaign_id,
        pixel_id,
        access_token,
        event_name,
        revenue_type
      }),
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
      throw new Error(`Invalid JSON response from Tonic API: ${responseText.substring(0, 200)}...`);
    }

    if (!response.ok) {
      console.error('Tonic API error response:', responseData);
      throw new Error(`Tonic API error: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify({
      data: responseData,
      message: 'Pixel configuration saved successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in save-tonic-pixel function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});