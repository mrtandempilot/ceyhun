import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');

  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  return NextResponse.json({
    debug: {
      received_mode: mode,
      received_token: verifyToken,
      received_challenge: challenge,
      expected_token_set: !!expectedToken,
      expected_token_value: expectedToken,
      token_match: verifyToken === expectedToken,
      all_params: Object.fromEntries(searchParams.entries())
    },
    timestamp: new Date().toISOString(),
    message: 'This is a test endpoint to debug webhook verification'
  });
}
