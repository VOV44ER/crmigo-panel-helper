import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id, pixel_id, event_type, access_token, test_token } = await req.json();

    console.log('Invoking pixel with params:', {
      campaign_id,
      pixel_id,
      event_type,
      // Not logging tokens for security
    });

    const response = await fetch(`https://api.publisher.tonic.com/privileged/display/details/pixel/${pixel_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('TONIC_TOKEN')}`,
      },
      body: JSON.stringify({
        'campaign_id': campaign_id,
        'pixel-pixel_id': pixel_id,
        'tiktok_access_token': access_token,
        'pixel-test-token': test_token,
        'pixel-event_type': event_type,
        'pixel-revenue_choice': 'preestimated_revenue',
        'pixel-target': 'tiktok'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tonic API error:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log('Tonic API response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ 
        errors: [error.message || 'Failed to invoke pixel'],
        successes: [] 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})