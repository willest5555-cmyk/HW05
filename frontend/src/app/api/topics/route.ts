import { NextResponse } from 'next/server';
import data from '@/data.json';

export async function GET() {
  const topics = data.topics.map((t: any) => ({
    id: t.id,
    title: t.title
  }));
  return NextResponse.json(topics);
}
