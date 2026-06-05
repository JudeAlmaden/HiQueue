# Production Environment Variables for Vercel

Set these in your Vercel project settings (Settings > Environment Variables):

## Database Connection (CRITICAL - Fixes connection pool exhaustion)

```bash
# Use Supabase Transaction mode pooler with connection limits
DATABASE_URL=postgresql://postgres.zbvfjaeghmjvkmdspmnh:spaghettiandmeatballs%232045@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Direct connection for migrations
DIRECT_DATABASE_URL=postgresql://postgres:spaghettiandmeatballs%232045@db.zbvfjaeghmjvkmdspmnh.supabase.co:5432/postgres
```

**Key changes:**
1. **Port 6543** - Transaction mode (not Session mode port 5432) - better for serverless
2. **connection_limit=1** - Each serverless function gets only 1 connection, preventing pool exhaustion
3. **pgbouncer=true** - Enables connection pooling optimizations

## Other Required Variables

```bash
AUTH_SECRET="your-production-secret-here"
NEXTAUTH_URL="https://your-production-domain.vercel.app"
APP_NAME="HiQueue"
NODE_ENV="production"
```

## Apply Changes

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `DATABASE_URL` to use **port 6543** and **connection_limit=1**
3. Redeploy your application

This will fix the "EMAXCONNSESSION max clients reached" errors in production.
