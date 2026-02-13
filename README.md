# ExpenseFlow - Islamic Finance Tracker

A comprehensive expense tracking application built with Next.js 14+, featuring Islamic finance principles including Zakat calculation.

## Features

- 📊 **Expense & Income Tracking**: Monitor all your financial transactions
- 📈 **Financial Analytics**: Visualize spending patterns with charts
- 🕌 **Zakat Calculator**: Calculate Zakat obligations based on Islamic principles
- 💰 **Budget Management**: Set and track budgets for different categories
- 🔐 **Secure Authentication**: Protected routes with NextAuth.js
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts
- **UI Components**: Radix UI
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── (protected)/
│   │   ├── dashboard/      # Main dashboard
│   │   ├── transactions/   # Transaction management
│   │   └── zakat/          # Zakat calculator
│   ├── api/
│   │   └── auth/           # NextAuth API routes
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── forms/              # Form components
│   ├── charts/             # Chart components
│   └── layout/             # Layout components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   ├── zakat.ts            # Zakat calculation utilities
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
└── middleware.ts           # Route protection middleware
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expensetracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/expenseflow"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Transaction**: Income and expense records
- **Category**: Transaction categories
- **Budget**: Budget allocations
- **ZakatRecord**: Zakat calculations and payments

## Zakat Calculation

The Zakat calculator follows Islamic principles:
- **Rate**: 2.5% of eligible wealth
- **Nisab**: Based on gold (87.48g) or silver (612.36g) threshold
- **Eligible Wealth**: Cash, bank balance, investments, gold, silver, business assets, and debts owed
- **Deductions**: Debts payable are deducted from total wealth

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Application URL (http://localhost:3000 for development) |

## Custom Colors

The application uses a custom color palette defined in `globals.css`:

- **Primary**: Blue (#2563eb)
- **Secondary**: Gray (#4b5563)
- **Success**: Green (#16a34a)
- **Danger**: Red (#dc2626)
- **Warning**: Yellow (#ca8a04)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
