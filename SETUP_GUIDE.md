# ExpenseFlow Setup Guide

This guide will help you complete the setup of your ExpenseFlow application.

## ✅ What's Already Done

The project has been initialized with:
- ✅ Next.js 14+ with TypeScript (strict mode)
- ✅ Tailwind CSS v4 configured with custom colors
- ✅ App Router structure
- ✅ ESLint and Prettier configured
- ✅ All required dependencies installed
- ✅ Project folder structure created
- ✅ Core library files (auth, zakat, utils)
- ✅ UI components (Button, Input, Card)
- ✅ Authentication pages (login, register)
- ✅ Protected route pages (dashboard, transactions, zakat)
- ✅ Prisma schema defined
- ✅ Environment file created

## 🔧 Next Steps to Complete Setup

### 1. Set Up PostgreSQL Database

You need a PostgreSQL database. Choose one of these options:

**Option A: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database: `createdb expenseflow`
3. Update `.env` with your connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/expenseflow"
   ```

**Option B: Cloud Database (Recommended for beginners)**
- Use [Supabase](https://supabase.com) (free tier available)
- Use [Neon](https://neon.tech) (free tier available)
- Use [Railway](https://railway.app) (free tier available)

After creating your database, copy the connection string to `.env`.

### 2. Generate Prisma Client and Run Migrations

Once your database is set up:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 3. Enable Prisma in the Code

After successfully running `npx prisma generate`, uncomment the Prisma client code:

**File: `src/lib/prisma.ts`**
```typescript
// Remove the commented code and replace with:
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# On Mac/Linux
openssl rand -base64 32
```

Update `.env` with the generated secret:
```
NEXTAUTH_SECRET="your-generated-secret-here"
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application!

## 📝 Implementation Checklist

### Authentication
- [ ] Test user registration
- [ ] Test user login
- [ ] Implement password hashing in registration API
- [ ] Add session management
- [ ] Test protected routes

### Transactions
- [ ] Create transaction form component
- [ ] Implement transaction API routes (CRUD)
- [ ] Add transaction list with filtering
- [ ] Implement category management
- [ ] Add transaction charts

### Zakat Calculator
- [ ] Connect form to zakat calculation logic
- [ ] Fetch current gold/silver prices (optional API integration)
- [ ] Save zakat calculations to database
- [ ] Display zakat history

### Dashboard
- [ ] Fetch real transaction data
- [ ] Calculate statistics
- [ ] Add charts for income/expense visualization
- [ ] Show recent transactions

### Additional Features
- [ ] Budget management
- [ ] Export data (CSV/PDF)
- [ ] Dark mode toggle
- [ ] Multi-currency support
- [ ] Recurring transactions

## 🎨 Customization

### Colors
Edit `src/app/globals.css` to change the color scheme:
```css
--color-primary: #2563eb;
--color-secondary: #4b5563;
/* etc. */
```

### Database Schema
Modify `prisma/schema.prisma` and run:
```bash
npx prisma migrate dev --name your_migration_name
```

## 🐛 Troubleshooting

### Prisma Generate Fails
- Ensure `DATABASE_URL` is correctly set in `.env`
- Check that PostgreSQL is running
- Verify the connection string format

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next` (or `Remove-Item -Recurse -Force .next` on Windows)
- Restart the dev server

### Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your development URL
- Ensure Prisma client is generated

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com)

## 🚀 Deployment

When ready to deploy:

1. Set up a production database
2. Update environment variables on your hosting platform
3. Build the project: `npm run build`
4. Deploy to Vercel, Railway, or your preferred platform

### Recommended Platforms
- **Vercel** (easiest for Next.js)
- **Railway** (includes database)
- **Netlify**
- **AWS/Google Cloud/Azure**

## 💡 Tips

- Use Prisma Studio (`npx prisma studio`) to manage your database visually
- Check the browser console for errors during development
- Use React DevTools for debugging components
- Test authentication flows thoroughly before deploying

## 🆘 Need Help?

If you encounter issues:
1. Check the error messages carefully
2. Review the relevant documentation
3. Search for similar issues on GitHub/Stack Overflow
4. Check that all environment variables are set correctly

Happy coding! 🎉
