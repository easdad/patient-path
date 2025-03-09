// This Edge Function syncs user_type from profiles to app_metadata.role
// It's called when a user's profile is updated

// @ts-ignore: Unreachable code error
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
// @ts-ignore: Unreachable code error
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key (required for updateUserById)
    const supabaseAdmin = createClient(
      // @ts-ignore: Deno is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the request body
    const { user_id, user_type } = await req.json()
    
    if (!user_id || !user_type) {
      return new Response(
        JSON.stringify({ error: 'user_id and user_type are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate the user_type
    const validUserTypes = ['hospital', 'ambulance', 'developer']
    if (!validUserTypes.includes(user_type)) {
      return new Response(
        JSON.stringify({ error: `Invalid user_type: ${user_type}. Must be one of: ${validUserTypes.join(', ')}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Update the user's app_metadata with the role
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { app_metadata: { role: user_type } }
    )

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${user_id} role updated to ${user_type}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 