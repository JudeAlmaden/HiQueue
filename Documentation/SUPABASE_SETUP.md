# Supabase Setup Guide

Complete guide to setting up HiQueue with Supabase PostgreSQL database.

---

## Why Supabase?

- **Free Tier**: 500MB database, unlimited API requests
- **PostgreSQL**: Production-ready database
- **Built-in Features**: Auth, Storage, Real-time subscriptions
- **Dashboard**: Easy-to-use web interface
- **Connection Pooling**: PgBouncer included
- **Backups**: Automatic daily backups on paid plans

---

## Step 1: Create Supabase Project

### 1.1 Sign Up
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or Email

### 1.2 Create New Project
1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `hiqueue` (or your preferred name)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Free (or paid for production)
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

---

## Step 2: Get Connection Strings

### 2.1 Navigate to Database Settings
1. In your project dashboard, click **Settings** (gear icon)
2. Click **Database** in the sidebar
3. Scroll to **Connection String** section

### 2.2 Copy Connection Strings

You'll see two connection modes:

**Connection Pooling (Recommended for HiQueue):**
```
postgresql://postgres.YOUR-PROJECT-REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Direct Connection (For migrations only):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-PROJECT-REF.supabase.co:5432/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password!

---

## Step 3: Update Environment Variables

### 3.1 Update `.env` File

Open your `.env` file and update:

```env
# =============================================================================
# DATABASE CONFIGURATION - SUPABASE
# =============================================================================

# Database Provider
DATABASE_PROVIDER="postgresql"

# Connection Pooling URL (for application queries)
# This uses PgBouncer (port 6543) for better performance
DATABASE_URL="postgresql://postgres.YOUR-PROJECT-REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct Connection URL (for migrations)
# This connects directly to PostgreSQL (port 5432)
DIRECT_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-PROJECT-REF.supabase.co:5432/postgres"

# Shadow Database (optional, for safer migrations)
# SHADOW_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-PROJECT-REF.supabase.co:5432/hiqueue_shadow"

# =============================================================================
# AUTHENTICATION
# =============================================================================

# Generate new secret for production
AUTH_SECRET="your-production-secret-here"
```

### 3.2 Replace Placeholders

Replace the following in your connection strings:
- `YOUR-PROJECT-REF` - Your Supabase project reference (found in dashboard)
- `[YOUR-PASSWORD]` - Your database password
- `aws-0-us-east-1` - Your region (might be different)

### 3.3 Generate AUTH_SECRET

```bash
# Generate a secure random secret
openssl rand -base64 32
```

Copy the output and paste it as your `AUTH_SECRET`.

---

## Step 4: Update Prisma Configuration

### 4.1 Update `prisma/schema/base.prisma`

Your schema should already support this, but verify:

```prisma
datasource db {
  provider = env("DATABASE_PROVIDER")
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL") // Add this line
}
```

If `directUrl` is not there, add it.

---

## Step 5: Run Migrations

### 5.1 Regenerate Prisma Client

```bash
npm run prisma:generate
```

### 5.2 Apply Migrations

```bash
# This uses DIRECT_DATABASE_URL for migrations
npm run prisma:migrate:deploy
```

If you see any errors, make sure:
- Database password is correct
- Connection strings are properly formatted
- Firewall/VPN isn't blocking connections

---

## Step 6: Verify Setup

### 6.1 Open Prisma Studio

```bash
npm run prisma:studio
```

This opens a GUI at `http://localhost:5555` to view your database.

### 6.2 Check Supabase Dashboard

1. Go to your Supabase project
2. Click **Table Editor**
3. You should see all your tables (User, Organization, Queue, etc.)

### 6.3 Test the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- User registration
- Organization creation
- Queue management

---

## Supabase-Specific Configuration

### Connection Limits

Free tier allows **60 concurrent connections**. For HiQueue:

**Recommended Settings:**
```env
# Add to your DATABASE_URL
?pgbouncer=true&connection_limit=1
```

This prevents connection pool exhaustion.

### SSL Mode

Supabase requires SSL. Your URLs should include:
```
?sslmode=require
```

Or for pooled connections:
```
?pgbouncer=true
```

### Transaction Mode

For better performance with PgBouncer:

```env
DATABASE_URL="postgresql://postgres.YOUR-PROJECT-REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=0"
```

---

## Database Management

### View Database in Supabase

**Table Editor:**
1. Click **Table Editor** in Supabase dashboard
2. Browse and edit data visually

**SQL Editor:**
1. Click **SQL Editor**
2. Run custom queries

### Backup Your Database

**Manual Backup:**
1. Click **Database** in settings
2. Click **Backups**
3. Click **Restore** on any backup point

**Automated Backups:**
- Free tier: Daily backups (7 days retention)
- Pro tier: Daily backups (30 days retention)
- Enterprise: Custom retention

**Export to SQL:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Export database
supabase db dump -f backup.sql --db-url "YOUR_DIRECT_URL"
```

---

## Performance Optimization

### 1. Enable Row Level Security (RLS)

While not required for HiQueue's auth model, RLS adds an extra security layer:

```sql
-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;

-- Create policies as needed
```

### 2. Create Indexes

For better query performance:

```sql
-- Index frequently queried fields
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_org_slug ON "Organization"(slug);
CREATE INDEX idx_queue_org ON "Queue"("organizationId");
CREATE INDEX idx_ticket_queue ON "Ticket"("queueId");
```

### 3. Monitor Performance

**In Supabase Dashboard:**
1. Click **Database** → **Logs**
2. View slow queries
3. Check connection usage

**Add Query Logging (Development):**
```typescript
// In your db client setup
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Solutions:**
1. Check your internet connection
2. Verify Supabase project is active (not paused)
3. Check connection string format
4. Ensure password doesn't have special characters that need encoding

**Encode Special Characters:**
```bash
# If password has special chars like @, #, %, etc.
# Encode them:
@ → %40
# → %23
% → %25
```

### Error: "Too many connections"

**Solution:**
Make sure you're using connection pooling:
```env
DATABASE_URL="...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### Error: "SSL connection required"

**Solution:**
Supabase requires SSL. Use:
```env
DATABASE_URL="...?sslmode=require"
```

Or for pooled connections (already includes SSL):
```env
DATABASE_URL="...?pgbouncer=true"
```

### Error: "Migration failed"

**Solution:**
1. Check `DIRECT_DATABASE_URL` is set (not pooled)
2. Verify you have write permissions
3. Check migration files in `prisma/schema/migrations/`
4. Reset and retry (development only):
   ```bash
   npm run prisma:migrate:reset
   ```

### Project Paused (Free Tier)

Free tier projects pause after 1 week of inactivity.

**Solution:**
1. Go to Supabase dashboard
2. Click "Restore" on your project
3. Wait 2-3 minutes for activation

---

## Environment-Specific Setup

### Development (Local)

Use SQLite locally, Supabase for staging/production:

```env
# .env.local (local development)
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

# .env (staging/production)
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://...supabase.com..."
```

### Staging Environment

Create a separate Supabase project:

```env
# .env.staging
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres.staging-project-ref:[PASSWORD]@...supabase.com..."
```

### Production Environment

Use production Supabase project with paid plan:

```env
# .env.production
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres.prod-project-ref:[PASSWORD]@...supabase.com..."

# Enable connection pooling
DATABASE_URL="...?pgbouncer=true&connection_limit=1"

# Use direct URL for migrations
DIRECT_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.prod-project-ref.supabase.co:5432/postgres"
```

---

## Deployment Integration

### Vercel Deployment

**1. Add Environment Variables:**
```bash
vercel env add DATABASE_PROVIDER
# Enter: postgresql

vercel env add DATABASE_URL
# Paste your pooled connection string

vercel env add DIRECT_DATABASE_URL
# Paste your direct connection string

vercel env add AUTH_SECRET
# Paste your generated secret
```

**2. Deploy:**
```bash
vercel deploy --prod
```

**3. Run Migrations:**
```bash
# Migrations run automatically via build command
# Or run manually:
vercel env pull
npm run prisma:migrate:deploy
```

### Railway Deployment

**1. Import Project:**
```bash
railway init
```

**2. Add Environment Variables:**
Go to Railway dashboard → Variables:
- `DATABASE_PROVIDER` = `postgresql`
- `DATABASE_URL` = Your pooled URL
- `DIRECT_DATABASE_URL` = Your direct URL
- `AUTH_SECRET` = Your secret

**3. Deploy:**
```bash
railway up
```

---

## Cost Estimation

### Free Tier Limits
- **Database**: 500MB storage
- **Bandwidth**: 2GB egress
- **Connections**: 60 concurrent
- **Backups**: 7 days retention
- **Project Pausing**: After 1 week inactivity

**Suitable for:**
- Development
- Small projects (<1000 users)
- Testing/prototypes

### Pro Tier ($25/month)
- **Database**: 8GB storage (+ $0.125/GB extra)
- **Bandwidth**: 50GB egress (+ $0.09/GB extra)
- **Connections**: Unlimited
- **Backups**: 30 days retention
- **No pausing**

**Suitable for:**
- Production apps
- Growing user base
- Business use

### When to Upgrade?

Upgrade when you hit:
- 400MB database size (80% of free tier)
- 50+ concurrent connections regularly
- Need 24/7 availability
- Need longer backup retention

---

## Security Best Practices

1. **Never commit `.env` to git**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use different databases for dev/prod**
   - Development: SQLite or separate Supabase project
   - Production: Dedicated Supabase project

3. **Rotate database password**
   - Change password every 90 days
   - Update in `.env` and deployment platform

4. **Enable Database Webhooks** (optional)
   - Get notified of database changes
   - Useful for audit logs

5. **Use Row Level Security** (optional)
   - Additional security layer
   - Define access policies per table

---

## Next Steps

After Supabase is set up:

1. ✅ Test all application features
2. ✅ Set up monitoring (Supabase logs)
3. ✅ Configure backups (automatic on paid plans)
4. ✅ Deploy to production (Vercel, Railway, etc.)
5. ✅ Set up CI/CD pipeline
6. ✅ Monitor database size and performance

---

## Support Resources

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **Prisma + Supabase**: [prisma.io/docs/guides/supabase](https://www.prisma.io/docs/guides/database/supabase)
- **HiQueue Issues**: [Your GitHub Issues Page]

---

## Quick Reference

**Start Project:**
```bash
npm run dev
```

**Run Migrations:**
```bash
npm run prisma:migrate:deploy
```

**View Database:**
```bash
npm run prisma:studio
# Or use Supabase Table Editor
```

**Check Connection:**
```bash
npx prisma db pull
# Should show "Introspected X models"
```

---

Need help? Check the [DATABASE_SETUP.md](./DATABASE_SETUP.md) for more details!
