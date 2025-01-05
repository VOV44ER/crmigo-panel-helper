import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the incoming request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    console.log('Received request with auth header:', authHeader);

    // Check for required environment variables
    const consumerKey = Deno.env.get('TONIC_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('TONIC_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      console.error('Missing Tonic API credentials');
      throw new Error('Tonic API credentials not configured');
    }

    console.log('Attempting to authenticate with Tonic API...');

    // First authenticate with Tonic API to get a token
    const tonicAuthResponse = await fetch('https://api.publisher.tonic.com/jwt/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });

    const responseText = await tonicAuthResponse.text();
    console.log('Tonic API auth response:', responseText);

    if (!tonicAuthResponse.ok) {
      console.error('Tonic API authentication failed:', responseText);
      throw new Error(`Failed to authenticate with Tonic API: ${responseText}`);
    }

    const tonicAuth = JSON.parse(responseText);
    console.log('Tonic authentication successful');

    // Now use the Tonic token to fetch campaigns
    const campaignsResponse = await fetch(
      'https://api.publisher.tonic.com/privileged/v3/campaign/list?state=active&output=json',
      {
        headers: {
          'Authorization': `Bearer ${tonicAuth.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!campaignsResponse.ok) {
      const error = await campaignsResponse.text();
      console.error('Failed to fetch campaigns:', error);
      throw new Error(`Failed to fetch campaigns: ${error}`);
    }

    const campaigns = await campaignsResponse.json();
    console.log('Successfully fetched campaigns');

    return new Response(JSON.stringify(campaigns), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in fetch-tonic-campaigns:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});