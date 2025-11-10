import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const base = getApiBaseUrl();
  const auth = req.headers.get('authorization') || '';
  const res = await fetch(`${base}/user/upload-id`, {
    method: 'POST',
    headers: { authorization: auth },
    body: form as any,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
