import { NextResponse } from 'next/server';
import data from '@/data.json';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const topic = data.topics.find((t: any) => t.id === params.id);
  
  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }
  
  return NextResponse.json(topic);
}
