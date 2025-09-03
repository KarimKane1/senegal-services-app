import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      ts: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch {
    return NextResponse.json(
      { 
        ok: false, 
        ts: new Date().toISOString(),
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}
