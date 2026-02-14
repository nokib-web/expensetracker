# Category Management System

## Overview
A comprehensive system for managing income and expense categories, including default seeding, custom category creation, and safe deletion with transaction reassignment.

## Components Implemented

### 1. Categories API (`app/api/categories/`)

#### GET `/api/categories`
- Returns user-specific categories.
- Optional query params: `type` (INCOME/EXPENSE), `includeCount` (boolean).
- If no type is specified, returns object grouped by type.
- Includes transaction counts via Prisma `_count`.

#### POST `/api/categories`
- Validates name and type.
- Checks for duplicates (case-insensitive name + type).
- Creates custom categories with `isSystem: false`.

#### PUT `/api/categories/[id]`
- Allows renaming categories.
- Prevents modification of `isSystem: true` (system) categories.
- Validates ownership.

#### DELETE `/api/categories/[id]`
- Prevents deletion of system categories.
- **Auto-reassignment**: If a deleted category has transactions, they are automatically moved to the "Uncategorized" category of the same type.
- Validates ownership.

### 2. Category Management Page (`app/(protected)/settings/categories/page.tsx`)
- Two-column layout for Income and Expense categories.
- Displays transaction counts for each category.
- Inline Add/Edit/Delete actions.
- System categories (like "Uncategorized") are protected from deletion/edit and marked with a "System" badge.

### 3. Reusable Category Select (`components/forms/CategorySelect.tsx`)
- Context-aware dropdown (Income or Expense).
- **Inline Creation**: Includes an "+ Add new category" option that opens a modal to create a category without leaving the current form.
- Handles loading and error states gracefully.

## Default Categories (Automatic Seeding)
When a new user registers, the following categories are automatically created:

### Income:
- Salary, Business Income, Investment Returns, Freelance, Gifts Received, Other Income, **Uncategorized** (System).

### Expense:
- Food & Dining, Transportation, Housing & Utilities, Shopping, Healthcare, Education, Entertainment, Subscriptions, Charity, Personal Care, Other Expenses, **Uncategorized** (System).

## Technical Implementation Details

### Database Schema Updates
```prisma
model Category {
  id        String       @id @default(uuid())
  userId    String
  name      String
  type      CategoryType
  isSystem  Boolean      @default(false) // Protects system-critical categories
  createdAt DateTime     @default(now())
  // ...
}
```

### Transaction Reassignment Logic
```typescript
if (category._count.transactions > 0) {
    const uncategorized = await prisma.category.findFirst({
        where: { userId, type: category.type, name: 'Uncategorized' }
    });
    
    await prisma.transaction.updateMany({
        where: { categoryId: id },
        data: { categoryId: uncategorized.id }
    });
}
```

### Category Selector Integration
The `TransactionForm` uses the `CategorySelect` component, which manages its own state and invalidates the categories query when a new one is added, ensuring the dropdown stays up-to-date across the app.

## Usage Guide
1. **Navigate** to Settings > Categories to manage your list.
2. **Add** new categories using the "Add" buttons at the top of each list.
3. **Delete** categories you no longer need; transactions will safely move to "Uncategorized".
4. **Quick Add**: While adding a transaction, use the "+ Add new category" option in the dropdown to create a category on the fly.
