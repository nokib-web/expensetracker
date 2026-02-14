# Dashboard Implementation

## Overview
Complete dashboard page with financial overview, statistics, charts, and recent transactions using React Query for data fetching.

## Components Implemented

### 1. Dashboard API (`app/api/dashboard/summary/route.ts`)

**GET Endpoint** that returns comprehensive financial data:

#### Data Returned:
- **Total Income**: Sum of all INCOME transactions
- **Total Expenses**: Sum of all EXPENSE transactions
- **Current Balance**: Income - Expenses
- **This Month's Income**: Current month income total
- **This Month's Expenses**: Current month expense total
- **Income Change**: Percentage change vs last month
- **Expense Change**: Percentage change vs last month
- **Top Spending Categories**: Top 5 categories by amount
- **Recent Transactions**: Last 10 transactions with details
- **Zakat Eligibility**: Boolean based on nisab threshold
- **Zakat Due**: Calculated amount (balance × rate)

#### Prisma Operations Used:
- `aggregate()` with `_sum` for totals
- `groupBy()` for category breakdown
- `findMany()` with `include` for transactions
- `findUnique()` for Zakat settings
- Date filtering with `date-fns` (startOfMonth, endOfMonth)
- User-scoped queries (WHERE userId = session.user.id)

#### Security:
- Session validation with getServerSession
- User-scoped data access
- Error handling with try-catch

### 2. Dashboard Page (`app/(protected)/dashboard/page.tsx`)

**Main dashboard** with four sections:

#### Sections:
1. **Stats Cards** (4 cards in grid)
   - Total Income (green, with % change)
   - Total Expenses (red, with % change)
   - Current Balance (blue)
   - Zakat Due (purple)

2. **Charts Section**
   - Expense Breakdown Pie Chart
   - Top 5 spending categories
   - Interactive tooltips

3. **Recent Transactions**
   - Table with last 10 transactions
   - Color-coded amounts (green/red)
   - "View All" link to /transactions

4. **Quick Actions** (sidebar)
   - Add Income button
   - Add Expense button
   - Pay Zakat button (conditional)

#### Features:
- React Query for data fetching
- Automatic revalidation
- Loading skeletons
- Error handling with toasts
- Responsive grid layout

### 3. Dashboard Components

#### StatsCard (`components/dashboard/StatsCard.tsx`)
Reusable metric card with:
- **Props**: title, value, icon, iconColor, change, isLoading
- **Features**:
  - Icon with colored background
  - Formatted currency value
  - Percentage change indicator
  - Color-coded change (green/red)
  - Loading skeleton
- **Styling**: Card with header and content sections

#### TransactionList (`components/dashboard/TransactionList.tsx`)
Transaction table component with:
- **Props**: transactions array, isLoading
- **Features**:
  - Table with Date, Description, Category, Amount columns
  - Badge for category
  - Color-coded amounts (green for income, red for expense)
  - "View All" link
  - Loading skeleton (5 rows)
  - Empty state message
- **Formatting**: formatDate, formatCurrency

#### ExpenseChart (`components/dashboard/ExpenseChart.tsx`)
Pie chart for expense breakdown:
- **Props**: data array, isLoading
- **Features**:
  - Recharts PieChart
  - 5 color palette
  - Percentage labels
  - Interactive tooltip
  - Legend
  - Loading skeleton (circular)
  - Empty state message
- **Data**: Top 5 spending categories

#### QuickActions (`components/dashboard/QuickActions.tsx`)
Action buttons component:
- **Props**: zakatDue, onAddIncome, onAddExpense, onPayZakat
- **Buttons**:
  - Add Income (green)
  - Add Expense (red)
  - Pay Zakat (purple, conditional)
- **Icons**: TrendingUp, TrendingDown, Coins

### 4. React Query Setup (`components/providers.tsx`)

**QueryClientProvider** configuration:
- Stale time: 60 seconds
- Refetch on window focus: disabled
- Wrapped around SessionProvider

## Data Flow

### 1. Page Load:
```
Dashboard Page
  ↓
useQuery (queryKey: 'dashboard-summary')
  ↓
GET /api/dashboard/summary
  ↓
Prisma Aggregations
  ↓
Return JSON data
  ↓
Update UI components
```

### 2. Data Fetching:
```typescript
const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
        const response = await fetch('/api/dashboard/summary');
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
    },
});
```

### 3. Loading States:
- Stats cards show skeleton placeholders
- Chart shows circular skeleton
- Transaction list shows 5 row skeletons

### 4. Error Handling:
- Toast notification on error
- Graceful degradation (show 0 values)
- Retry functionality via React Query

## Prisma Queries

### Total Income:
```typescript
await prisma.transaction.aggregate({
    where: { userId, type: 'INCOME' },
    _sum: { amount: true },
});
```

### This Month's Expenses:
```typescript
await prisma.transaction.aggregate({
    where: {
        userId,
        type: 'EXPENSE',
        transactionDate: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
        },
    },
    _sum: { amount: true },
});
```

### Top Categories:
```typescript
await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'EXPENSE' },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5,
});
```

### Recent Transactions:
```typescript
await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { transactionDate: 'desc' },
    take: 10,
});
```

## Calculations

### Percentage Change:
```typescript
const change = lastMonth > 0
    ? ((thisMonth - lastMonth) / lastMonth) * 100
    : 0;
```

### Zakat Eligibility:
```typescript
const zakatEligible = currentBalance >= nisabAmount;
const zakatDue = currentBalance * (zakatRate / 100);
```

### Current Balance:
```typescript
const currentBalance = totalIncome - totalExpenses;
```

## Styling

### Grid Layouts:
- Stats: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Charts: `grid-cols-1 lg:grid-cols-3` (2:1 ratio)

### Color Scheme:
- **Income**: Green (green-600)
- **Expense**: Red (red-600)
- **Balance**: Blue (blue-600)
- **Zakat**: Purple (purple-600)
- **Chart Colors**: Blue, Green, Orange, Red, Purple

### Spacing:
- Page: `space-y-8`
- Cards: `gap-6`
- Content: Responsive padding

## Dependencies

### New:
- `@tanstack/react-query`: Data fetching and caching
- `recharts`: Chart library
- `date-fns`: Date manipulation

### Used:
- `next-auth`: Session management
- `react-hot-toast`: Notifications
- `lucide-react`: Icons

## Usage Examples

### Fetching Dashboard Data:
```typescript
const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardData,
});
```

### Using StatsCard:
```typescript
<StatsCard
    title="Total Income"
    value={5000}
    icon={TrendingUp}
    iconColor="bg-green-600"
    change={12.5}
    isLoading={false}
/>
```

### Using ExpenseChart:
```typescript
<ExpenseChart
    data={[
        { categoryName: 'Food', amount: 500 },
        { categoryName: 'Transport', amount: 200 },
    ]}
    isLoading={false}
/>
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── dashboard/
│   │       └── summary/
│   │           └── route.ts
│   └── (protected)/
│       └── dashboard/
│           └── page.tsx
├── components/
│   ├── providers.tsx (updated)
│   └── dashboard/
│       ├── StatsCard.tsx
│       ├── TransactionList.tsx
│       ├── ExpenseChart.tsx
│       └── QuickActions.tsx
```

## Performance Optimizations

1. **React Query Caching**:
   - 60-second stale time
   - Automatic background refetching
   - Deduplication of requests

2. **Loading States**:
   - Skeleton placeholders
   - Prevents layout shift
   - Better perceived performance

3. **Prisma Optimizations**:
   - Aggregations instead of fetching all records
   - Limited query results (take: 10, take: 5)
   - Indexed fields for faster queries

4. **Component Optimization**:
   - Memoized query client
   - Conditional rendering
   - Lazy loading for charts

## Next Steps

1. Add monthly trend chart (6-month line chart)
2. Implement transaction modals/forms
3. Add date range filters
4. Export functionality
5. Print dashboard
6. Add more chart types
7. Implement real-time updates
8. Add dashboard customization

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Stats cards show correct values
- [ ] Percentage changes calculate correctly
- [ ] Chart displays top categories
- [ ] Recent transactions table populates
- [ ] Quick action buttons navigate correctly
- [ ] Loading skeletons appear during fetch
- [ ] Error toast shows on API failure
- [ ] Zakat button appears when due
- [ ] Responsive on mobile/tablet/desktop
