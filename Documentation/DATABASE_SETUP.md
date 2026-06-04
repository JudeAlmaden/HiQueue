# Database Setup Guide

This guide explains how to configure HiQueue with different database providers.

## Supported Databases

HiQueue supports multiple database providers through Prisma:
- **SQLite** (Development, default)
- **PostgreSQL** (Production recommended)
- **MySQL** (Production)
- **CockroachDB** (Cloud, distributed)
- **SQL Server** (Enterprise)
- **MongoDB** (Document store)

---

## Quick Start (SQLite - Development)

SQLite is configured by default and requires no setup:

```bash
# Already configured in .env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

# Run migrations
npm run prisma:migrate

# Start development
npm run dev
```

---

## Production Setup

### Option 1: PostgreSQL (Recommended)

**1. Install PostgreSQL:**
- **macOS**: `brew install postgresql`
- **Ubuntu**: `sudo apt-get install postgresql`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

**2. Create Database:**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE hiqueue;
CREATE USER hiqueue_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hiqueue TO hiqueue_user;
```

**3. Update .env:**
```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://hiqueue_user:your_secure_password@localhost:5432/hiqueue?schema=public"
```

**4. Run Migrations:**
```bash
npm run prisma:migrate:deploy
```

---

### Option 2: MySQL

**1. Install MySQL:**
- **macOS**: `brew install mysql`
- **Ubuntu**: `sudo apt-get install mysql-server`
- **Windows**: Download from [mysql.com](https://dev.mysql.com/downloads/)

**2. Create Database:**
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database and user
CREATE DATABASE hiqueue;
CREATE USER 'hiqueue_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON hiqueue.* TO 'hiqueue_user'@'localhost';
FLUSH PRIVILEGES;
```

**3. Update .env:**
```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://hiqueue_user:your_secure_password@localhost:3306/hiqueue"
```

**4. Run Migrations:**
```bash
npm run prisma:migrate:deploy
```

---

### Option 3: CockroachDB (Cloud)

**1. Create CockroachDB Account:**
- Sign up at [cockroachlabs.cloud](https://cockroachlabs.cloud/)
- Create a new cluster
- Create a database called `hiqueue`

**2. Get Connection String:**
- Navigate to your cluster
- Click "Connect"
- Copy the connection string

**3. Update .env:**
```env
DATABASE_PROVIDER="cockroachdb"
DATABASE_URL="postgresql://username:password@host:26257/hiqueue?sslmode=verify-full"
```

**4. Run Migrations:**
```bash
npm run prisma:migrate:deploy
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_PROVIDER` | Database type | `postgresql` |
| `DATABASE_URL` | Connection string | See examples below |
| `AUTH_SECRET` | Authentication secret | Generate with `openssl rand -base64 32` |

### Optional Variables

| Variable | Description | Use Case |
|----------|-------------|----------|
| `DIRECT_DATABASE_URL` | Direct database connection | Connection pooling with PgBouncer |
| `SHADOW_DATABASE_URL` | Shadow database for migrations | Cloud databases (required) |
| `NEXTAUTH_URL` | Application URL | Production deployments |

---

## Connection String Examples

### SQLite (Development)
```
file:./dev.db
```

### PostgreSQL (Local)
```
postgresql://username:password@localhost:5432/hiqueue?schema=public
```

### PostgreSQL (Heroku)
```
postgresql://user:pass@ec2-xxx.compute-1.amazonaws.com:5432/dbname?sslmode=require
```

### PostgreSQL (Supabase)
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
```

### MySQL (Local)
```
mysql://username:password@localhost:3306/hiqueue
```

### MySQL (PlanetScale)
```
mysql://username:password@aws.connect.psdb.cloud/hiqueue?sslaccept=strict
```

### CockroachDB (Cloud)
```
postgresql://username:password@host:26257/hiqueue?sslmode=verify-full
```

---

## Connection Pooling (Production)

For production PostgreSQL deployments, use connection pooling to improve performance:

### Using PgBouncer

**1. Install PgBouncer:**
```bash
# Ubuntu/Debian
sudo apt-get install pgbouncer

# macOS
brew install pgbouncer
```

**2. Configure PgBouncer:**
```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
hiqueue = host=localhost port=5432 dbname=hiqueue

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

**3. Update .env:**
```env
# Direct connection (for migrations)
DIRECT_DATABASE_URL="postgresql://user:pass@localhost:5432/hiqueue"

# Pooled connection (for application)
DATABASE_URL="postgresql://user:pass@localhost:6432/hiqueue?pgbouncer=true"
```

### Using Prisma Data Proxy

Alternative to PgBouncer, managed by Prisma:

```env
# Original database
DIRECT_DATABASE_URL="postgresql://user:pass@localhost:5432/hiqueue"

# Prisma Data Proxy
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=YOUR_API_KEY"
```

---

## Migration Commands

### Development (SQLite)
```bash
# Create a new migration
npm run prisma:migrate:dev

# Reset database (WARNING: Deletes all data)
npm run prisma:migrate:reset

# Generate Prisma Client
npm run prisma:generate
```

### Production (PostgreSQL/MySQL)
```bash
# Apply pending migrations
npm run prisma:migrate:deploy

# Check migration status
npx prisma migrate status

# Generate Prisma Client
npm run prisma:generate
```

---

## Switching Databases

To switch from one database to another:

**1. Backup Current Data:**
```bash
# SQLite
cp prisma/dev.db prisma/dev.db.backup

# PostgreSQL
pg_dump hiqueue > backup.sql

# MySQL
mysqldump hiqueue > backup.sql
```

**2. Update .env:**
Change `DATABASE_PROVIDER` and `DATABASE_URL`

**3. Regenerate Prisma Client:**
```bash
npm run prisma:generate
```

**4. Run Migrations:**
```bash
npm run prisma:migrate:deploy
```

**5. Migrate Data (if needed):**
```bash
# Export from old database
npx prisma db pull --schema=./prisma/schema.prisma

# Import to new database
# Use database-specific import tools
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Solution:**
- Check database is running: `sudo service postgresql status`
- Verify connection string in `.env`
- Check firewall settings
- Ensure database user has proper permissions

### Error: "Migration failed"

**Solution:**
- Check database schema compatibility
- Review migration files in `prisma/schema/migrations/`
- Reset migrations: `npm run prisma:migrate:reset` (development only)

### Error: "Pool exhausted"

**Solution:**
- Implement connection pooling (PgBouncer)
- Increase `max_client_conn` in PgBouncer config
- Review application for connection leaks

### Error: "SSL connection required"

**Solution:**
Add SSL parameters to connection string:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

---

## Performance Tips

### PostgreSQL

1. **Enable Connection Pooling** (PgBouncer or Prisma Data Proxy)
2. **Create Indexes** on frequently queried fields
3. **Use EXPLAIN ANALYZE** to optimize slow queries
4. **Configure PostgreSQL** settings for your workload:
   ```sql
   ALTER SYSTEM SET shared_buffers = '256MB';
   ALTER SYSTEM SET effective_cache_size = '1GB';
   ```

### MySQL

1. **Use InnoDB Engine** (default)
2. **Enable Query Cache** for read-heavy workloads
3. **Optimize Buffer Pool Size**:
   ```sql
   SET GLOBAL innodb_buffer_pool_size = 268435456; -- 256MB
   ```

### SQLite

1. **Enable WAL Mode** for better concurrency:
   ```sql
   PRAGMA journal_mode=WAL;
   ```
2. **Increase Cache Size**:
   ```sql
   PRAGMA cache_size = -64000; -- 64MB
   ```

---

## Security Best Practices

1. **Never commit .env file** to version control
2. **Use strong passwords** for database users
3. **Limit database user permissions** to only what's needed
4. **Enable SSL/TLS** for production databases
5. **Use environment-specific secrets** (different for dev/staging/prod)
6. **Rotate AUTH_SECRET** regularly
7. **Use read replicas** for scaling read operations
8. **Enable audit logging** in production

---

## Cloud Deployment Options

### Vercel + PostgreSQL (Supabase)

**1. Deploy to Vercel:**
```bash
vercel deploy
```

**2. Add Database:**
- Create Supabase project
- Copy connection string
- Add to Vercel environment variables

**3. Run Migrations:**
```bash
vercel env pull
npm run prisma:migrate:deploy
```

### AWS + RDS

**1. Create RDS Instance:**
- Choose PostgreSQL or MySQL
- Configure security groups
- Note connection details

**2. Update Environment:**
```env
DATABASE_URL="postgresql://user:pass@your-rds.amazonaws.com:5432/hiqueue"
```

**3. Deploy Application:**
- Use AWS Elastic Beanstalk, ECS, or EC2
- Set environment variables
- Run migrations

### Railway

**1. Create Railway Project:**
```bash
railway init
```

**2. Add PostgreSQL:**
```bash
railway add
```

**3. Deploy:**
```bash
railway up
```

---

## Monitoring

### Database Health Checks

Add to your application:

```typescript
// src/lib/health.ts
import { db } from "@/server/lib/db"

export async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1`
    return { status: "healthy", database: "connected" }
  } catch (error) {
    return { status: "unhealthy", database: "disconnected", error }
  }
}
```

### Query Logging (Development)

Enable in `prisma.config.ts`:

```typescript
import { PrismaClient } from "@prisma/client"

export const db = new PrismaClient({
  log: ["query", "info", "warn", "error"],
})
```

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Database Design Best Practices](https://www.prisma.io/dataguide)
