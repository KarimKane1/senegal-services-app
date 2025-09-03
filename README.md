# Trust Network - Jokko Web

A Next.js application for connecting people with trusted service providers through their social networks.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x (see `.nvmrc`)
- npm or yarn
- Supabase account and project

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd jokko-web
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ADMIN_EMAILS=your-email@example.com,admin2@example.com
   ENCRYPTION_KEY_HEX=your_encryption_key_hex
   ```

3. **Run database migrations:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase/events.sql` to create the events table

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - App: http://localhost:3000
   - Health check: http://localhost:3000/api/health

## 🌐 Deployment to Vercel

### Step 1: Prepare Repository

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub repository:**
   - Go to GitHub and create a new repository
   - Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Set up Supabase Environments

You'll need **two separate Supabase projects**:

#### Staging Environment
1. Create a new Supabase project for staging
2. Run the database migrations:
   - Copy contents of `supabase/events.sql`
   - Run in Supabase SQL Editor
3. Note down the project URL and API keys

#### Production Environment
1. Create a new Supabase project for production
2. Run the same database migrations
3. Note down the project URL and API keys

### Step 3: Deploy to Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**

   **For Preview/Staging:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
   ADMIN_EMAILS=your-email@example.com,admin2@example.com
   ENCRYPTION_KEY_HEX=your_encryption_key_hex
   NODE_ENV=production
   ```

   **For Production:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   ADMIN_EMAILS=your-email@example.com,admin2@example.com
   ENCRYPTION_KEY_HEX=your_encryption_key_hex
   NODE_ENV=production
   ```

3. **Deploy:**
   - Vercel will automatically deploy from your `main` branch
   - Preview deployments will be created for pull requests

### Step 4: Verify Deployment

1. **Check health endpoint:**
   ```
   https://your-app.vercel.app/api/health
   ```
   Should return: `{"ok": true, "ts": "...", "environment": "production"}`

2. **Test admin access:**
   - Go to `https://your-app.vercel.app/admin`
   - Should redirect to login page
   - Only emails in `ADMIN_EMAILS` can access

3. **Test event tracking:**
   - Perform actions in the app (signup, contact clicks, etc.)
   - Check Supabase events table for new entries

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `ADMIN_EMAILS` | Comma-separated list of admin emails | ✅ |
| `ENCRYPTION_KEY_HEX` | 64-character hex key for phone encryption | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |
| `DATABASE_URL` | Direct Postgres connection (optional) | ❌ |

## 🛡️ Security Features

- **Admin Route Protection**: `/admin` routes are protected by middleware
- **Email-based Admin Access**: Only emails in `ADMIN_EMAILS` can access admin
- **Phone Number Encryption**: Sensitive data encrypted with `ENCRYPTION_KEY_HEX`
- **Row Level Security**: Supabase RLS policies protect user data
- **No Secrets in Client**: Service role key never exposed to browser

## 📊 Analytics & Events

The app tracks the following events:
- `signup` - User registration
- `search` - Service provider searches
- `provider_view` - Profile views
- `contact_click` - WhatsApp contact clicks
- `recommendation_create` - New recommendations
- `connection_request` - Connection requests
- `admin_login` - Admin dashboard access

Events are stored in the `events` table and can be queried for analytics.

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── seeker/            # User-facing pages
├── components/            # React components
├── lib/                   # Utilities and helpers
├── supabase/              # Database migrations
├── .github/workflows/     # CI/CD
└── public/                # Static assets
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔄 CI/CD Pipeline

- **Pull Requests**: Automatic preview deployments
- **Main Branch**: Automatic production deployment
- **Checks**: Linting, building, and testing on every push

## 📝 Database Migrations

To add new database changes:

1. Create SQL migration file in `supabase/`
2. Run in both staging and production Supabase projects
3. Update this README if needed

## 🆘 Troubleshooting

### Common Issues

1. **Build fails**: Check environment variables are set correctly
2. **Admin access denied**: Verify email is in `ADMIN_EMAILS`
3. **Events not tracking**: Check Supabase RLS policies
4. **Phone numbers not saving**: Verify `ENCRYPTION_KEY_HEX` is set

### Support

- Check Vercel deployment logs
- Check Supabase logs in dashboard
- Review browser console for client errors

## 📄 License

Private project - All rights reserved.