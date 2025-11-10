import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = (form.get('email') || (await req.json().catch(() => ({ email: '' }))).email) as string;
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const apiKey = process.env.BREVO_API_KEY as string | undefined;
  if (!apiKey) return NextResponse.json({ subscribed: true });

  await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  }).catch(() => {});

  return NextResponse.json({ subscribed: true });
}
