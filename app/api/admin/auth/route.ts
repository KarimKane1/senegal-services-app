import { NextResponse } from 'next/server';
// Use stub client to prevent build-time Supabase imports
const createClient = (url?: string, key?: string) => ({
  auth: {
    signInWithPassword: (credentials: any) => Promise.resolve({ data: { user: null, session: null }, error: null }),
    getUser: (token?: string) => Promise.resolve({ data: { user: null }, error: null })
  }
});
import { trackServerEvent } from '../../../../lib/trackEvent';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if email is in admin emails list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    if (!adminEmails.includes(email)) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Create Supabase client for authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Track admin login event
    await trackServerEvent('admin_login', data.user.id, { email });

    // Return the session token
    return NextResponse.json({ 
      success: true, 
      token: data.session?.access_token,
      user: { email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Create Supabase client to verify the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user email is in admin emails list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    
    if (!adminEmails.includes(user.email!)) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    return NextResponse.json({ 
      valid: true, 
      user: { email: user.email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin token validation error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
