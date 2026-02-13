import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Calculator, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-[--color-primary]">ExpenseFlow</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your comprehensive Islamic finance tracker. Manage expenses, track income, and calculate
            Zakat with ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wallet className="w-12 h-12 text-[--color-primary] mb-2" />
              <CardTitle className="text-xl">Expense Tracking</CardTitle>
              <CardDescription>
                Track your daily expenses and income with detailed categorization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-[--color-success] mb-2" />
              <CardTitle className="text-xl">Financial Insights</CardTitle>
              <CardDescription>
                Visualize your spending patterns with beautiful charts and analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calculator className="w-12 h-12 text-[--color-warning] mb-2" />
              <CardTitle className="text-xl">Zakat Calculator</CardTitle>
              <CardDescription>
                Calculate your Zakat obligations accurately based on Islamic principles
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 text-[--color-secondary] mb-2" />
              <CardTitle className="text-xl">Secure & Private</CardTitle>
              <CardDescription>
                Your financial data is encrypted and stored securely
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose ExpenseFlow?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-[--color-primary] mr-2">✓</span>
                <span>
                  <strong>Islamic Finance Compliant:</strong> Built with Islamic financial
                  principles in mind, including Zakat calculation
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[--color-primary] mr-2">✓</span>
                <span>
                  <strong>Comprehensive Tracking:</strong> Monitor all your income and expenses in
                  one place
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[--color-primary] mr-2">✓</span>
                <span>
                  <strong>Smart Analytics:</strong> Get insights into your spending habits with
                  detailed reports
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-[--color-primary] mr-2">✓</span>
                <span>
                  <strong>Budget Management:</strong> Set budgets and track your progress towards
                  financial goals
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
