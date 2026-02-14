'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, CreditCard, Bell, Tag, Shield, User } from 'lucide-react';

const settingsGroups = [
    {
        title: 'Preferences',
        items: [
            {
                name: 'Categories',
                description: 'Manage your income and expense categories',
                href: '/settings/categories',
                icon: Tag,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
            },
            {
                name: 'Zakat Settings',
                description: 'Configure Nisab thresholds and calculation methods',
                href: '/settings/zakat',
                icon: Shield,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
            },
        ],
    },
    {
        title: 'Account',
        items: [
            {
                name: 'Profile',
                description: 'Update your personal information and email',
                href: '/profile',
                icon: User,
                color: 'text-green-600',
                bg: 'bg-green-50',
            },
            {
                name: 'Security',
                description: 'Change your password and manage sessions',
                href: '/settings/security',
                icon: Shield,
                color: 'text-red-600',
                bg: 'bg-red-50',
            },
        ],
    },
];

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and configurations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {settingsGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700 ml-1">{group.title}</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {group.items.map((item) => (
                                <Link key={item.name} href={item.href}>
                                    <Card className="hover:border-blue-300 transition-all hover:shadow-md cursor-pointer group">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                                <item.icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
