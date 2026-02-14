# Database Setup Guide

## Prerequisites

Before setting up the database, you need to have PostgreSQL installed on your system.

### Installing PostgreSQL on Windows

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

## Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `DATABASE_URL` in `.env` with your PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/expensetracker"
   ```

   Replace:
   - `USERNAME`: Your PostgreSQL username (default: `postgres`)
   - `PASSWORD`: Your PostgreSQL password
   - `expensetracker`: The database name (you can change this)

3. Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
   
   Or use an online generator: https://generate-secret.vercel.app/32

## Database Setup Steps

### 1. Create the Database

Connect to PostgreSQL and create the database:

```bash
# Using psql command line
psql -U postgres

# Then in psql:
CREATE DATABASE expensetracker;
\q
```

Or use pgAdmin (GUI tool that comes with PostgreSQL).

### 2. Run Prisma Migrations

Once PostgreSQL is installed and the database is created:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# (Optional) Seed the database with demo data
npx prisma db seed
```

### 3. Verify Setup

Check that all tables were created:

```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can view and edit your database.

## Database Schema

The application uses the following models:

### User
- Stores user authentication and profile information
- Relations: categories, transactions, zakatSettings, zakatAssets, zakatPayments

### Category
- Income and expense categories
- Each user has their own categories
- Types: INCOME, EXPENSE

### Transaction
- All financial transactions (income/expense)
- Linked to categories and users
- Stores amount, description, and date

### ZakatSettings
- User-specific Zakat calculation settings
- Nisab amount and calculation method
- One-to-one relationship with User

### ZakatAsset
- Tracks different types of assets for Zakat calculation
- Types: CASH, SAVINGS, GOLD, INVESTMENT

### ZakatPayment
- Records of Zakat payments made
- Includes amount, date, and optional notes

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Verify PostgreSQL is running:
   ```bash
   # Windows
   Get-Service -Name "*postgres*"
   ```

2. Check if you can connect:
   ```bash
   psql -U postgres -d expensetracker
   ```

3. Verify your DATABASE_URL format is correct

### Migration Issues

If migrations fail:

1. Reset the database:
   ```bash
   npx prisma migrate reset
   ```

2. Run migrations again:
   ```bash
   npx prisma migrate dev --name init
   ```

### Prisma Client Issues

If you get import errors:

1. Regenerate the client:
   ```bash
   npx prisma generate
   ```

2. Restart your development server

## Seed Data

The seed script creates:
- A demo user (email: `demo@expensetracker.com`, password: `demo123`)
- Default income categories: Salary, Business, Investment, Gift, Other
- Default expense categories: Food, Transport, Bills, Shopping, Healthcare, Education, Entertainment, Other
- Default Zakat settings

You can customize the seed data in `prisma/seed.ts`.

## Production Deployment

For production:

1. Use a managed PostgreSQL service (e.g., Supabase, Railway, Neon)
2. Update `DATABASE_URL` with the production connection string
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Do NOT run seed in production (unless you want demo data)

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js + Prisma Guide](https://www.prisma.io/nextjs)
