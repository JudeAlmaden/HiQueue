# 🚀 Supabase Quick Start

Get HiQueue running with Supabase in 5 minutes!

## ✅ Checklist

### 1. Create Supabase Project (2 min)
- [ ] Go to [supabase.com](https://supabase.com) and sign up
- [ ] Click "New Project"
- [ ] Name: `hiqueue`
- [ ] Generate & **SAVE** database password
- [ ] Choose region (closest to you)
- [ ] Click "Create project" (wait 2-3 min)

### 2. Get Connection Strings (1 min)
- [ ] In Supabase: Settings → Database
- [ ] Find "Connection Pooling" section
- [ ] Copy the **Transaction mode** connection string
- [ ] Find "Connection String" section (direct)
- [ ] Copy the **URI** connection string

### 3. Update `.env` File (1 min)
```env
DATABASE_PROVIDER="postgresql"

# Replace YOUR-PROJECT-REF, YOUR-PASSWORD, and region
DATABASE_URL="postgresql://postgres.YOUR-PROJECT-REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

DIRECT_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-PROJECT-REF.supabase.co:5432/postgres"

# Generate new secret: openssl rand -base64 32
AUTH_SECRET="your-new-secret-here"
```

### 4. Run Migrations (1 min)
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply migrations
npm run prisma:migrate:deploy
```

### 5. Start Application (<1 min)
```bash
npm run dev
```

Visit http://localhost:3000 🎉

---

## 🆘 Problems?

**Can't connect to database:**
- Check password has no unencoded special characters
- Verify project is active (not paused)
- Check connection strings are correct

**Migrations failing:**
- Make sure `DIRECT_DATABASE_URL` is set (not pooled)
- Verify you copied the direct connection string

**Still stuck:**
See [Documentation/SUPABASE_SETUP.md](./Documentation/SUPABASE_SETUP.md) for detailed guide

---

## 📊 Verify Setup

**Option 1: Prisma Studio**
```bash
npm run prisma:studio
```
Opens at http://localhost:5555

**Option 2: Supabase Dashboard**
- Go to your project → Table Editor
- Should see all tables (User, Organization, Queue, etc.)

---

## 🚀 Deploy to Production

**Vercel:**
```bash
vercel env add DATABASE_PROVIDER
vercel env add DATABASE_URL  
vercel env add DIRECT_DATABASE_URL
vercel env add AUTH_SECRET
vercel deploy --prod
```

**Railway:**
```bash
railway init
# Add env vars in dashboard
railway up
```

---

**Full documentation:** [Documentation/SUPABASE_SETUP.md](./Documentation/SUPABASE_SETUP.md)
