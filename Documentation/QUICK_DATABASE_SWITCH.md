# Quick Database Switch Guide

## TL;DR - Switch Database in 3 Steps

### 1. Update `.env` file:

**For PostgreSQL:**
```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://username:password@localhost:5432/hiqueue"
```

**For MySQL:**
```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://username:password@localhost:3306/hiqueue"
```

**For SQLite (default):**
```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

### 2. Regenerate Prisma Client:
```bash
npm run prisma:generate
```

### 3. Run Migrations:
```bash
npm run prisma:migrate:deploy
```

---

## Common Database URLs

### Local Development

```env
# SQLite (no setup needed)
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

# PostgreSQL (local)
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres:password@localhost:5432/hiqueue"

# MySQL (local)
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://root:password@localhost:3306/hiqueue"
```

### Cloud Providers

```env
# Supabase (PostgreSQL)
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# PlanetScale (MySQL)
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://[USERNAME]:[PASSWORD]@[HOST]/hiqueue?sslaccept=strict"

# Railway (PostgreSQL)
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/railway"

# Heroku (PostgreSQL)
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgres://[USER]:[PASSWORD]@[HOST]:5432/[DATABASE]"
```

---

## NPM Scripts Reference

```bash
# Generate Prisma Client (run after changing DATABASE_PROVIDER)
npm run prisma:generate

# Create migration (development)
npm run prisma:migrate

# Apply migrations (production)
npm run prisma:migrate:deploy

# Reset database (WARNING: deletes all data)
npm run prisma:migrate:reset

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Push schema without migrations (prototyping)
npm run prisma:push
```

---

## Troubleshooting

**Error: "Environment variable not found: DATABASE_PROVIDER"**
- Make sure `DATABASE_PROVIDER` is set in your `.env` file

**Error: "Can't reach database server"**
- Check database is running
- Verify connection string format
- Test connection: `telnet localhost 5432` (PostgreSQL) or `telnet localhost 3306` (MySQL)

**Error: "SSL connection required"**
- Add SSL parameter to URL: `?sslmode=require`

---

## Production Checklist

- [ ] Set strong `AUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Use PostgreSQL or MySQL (not SQLite)
- [ ] Enable SSL/TLS in connection string
- [ ] Set up connection pooling (PgBouncer recommended)
- [ ] Configure backup strategy
- [ ] Set `NODE_ENV=production`
- [ ] Never commit `.env` to git

---

For detailed setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)
