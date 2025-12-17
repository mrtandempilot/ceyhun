export async function GET() {
  console.log('🔍 TEST API CALLED FROM VERCEL');
  return new Response(JSON.stringify({
    message: 'Test API works!',
    timestamp: new Date().toISOString(),
    env_vars: {
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
