// Follow this Supabase Edge Function pattern to securely set developer roles
// This function should be deployed to your Supabase project

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
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
    // Create a Supabase client with the Admin key (required for setting app_metadata)
    const supabaseAdmin = createClient(
      // These will be automatically injected when deployed to Supabase
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the request body
    const { user_id } = await req.json()
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verify that the caller has an authorized email address
    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ error: 'Could not get user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Check if the user's email is in the allowlist
    const allowedEmails = Deno.env.get('DEVELOPER_EMAILS')?.split(',') ?? []
    
    if (!allowedEmails.includes(user.email)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to set developer role' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Update the user's app_metadata to include the developer role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { app_metadata: { role: 'developer' } }
    )

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Developer role set successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 