'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type NotificationType = 'ZAKAT_DUE' | 'MONTHLY_SUMMARY' | 'LARGE_TRANSACTION' | 'BUDGET_WARNING' | 'PAYMENT_REMINDER' | 'INFO';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: Boolean;
    link?: string;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Fetch notifications from API
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => fetch('/api/notifications').then(res => res.json()),
        enabled: !!session?.user,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ isRead: true }) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => fetch('/api/notifications/mark-all-read', { method: 'POST' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const clearAllMutation = useMutation({
        mutationFn: () => fetch('/api/notifications', { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const addNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'warning':
                toast(message, { icon: '⚠️', style: { border: '1px solid #f59e0b', padding: '16px', color: '#b45309' } });
                break;
            case 'info':
                toast(message, { icon: 'ℹ️', style: { border: '1px solid #3b82f6', padding: '16px', color: '#1d4ed8' } });
                break;
        }
    }, []);

    const markAsRead = (id: string) => markAsReadMutation.mutate(id);
    const markAllAsRead = () => markAllReadMutation.mutate();
    const clearAll = () => clearAllMutation.mutate();

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll,
            isLoading
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
