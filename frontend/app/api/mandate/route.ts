import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

export async function POST(req: NextRequest) {
  const base = getApiBaseUrl();
  const auth = req.headers.get('authorization') || '';
  const create = await fetch(`${base}/mandate/create`, { method: 'POST', headers: { authorization: auth } });
  if (!create.ok) return NextResponse.json({ error: 'failed' }, { status: create.status });
  const sign = await fetch(`${base}/mandate/sign`, { method: 'POST', headers: { authorization: auth } });
  const data = await sign.json().catch(() => ({}));
  return NextResponse.json({ ok: true, ...data }, { status: sign.status });
}
