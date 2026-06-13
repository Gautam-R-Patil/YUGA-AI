import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { apiRequest } from '../../../core/utils/api';

const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BCCYxE4d1Y_pYFH13QBPBlH8oc2TvAT69KLqMWOeRZHIpEaGKZK3Hrzs04pwjnbGOCr2d5IYNXU7OeCVxlAeIvA';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const PushSubscriptionButton = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                setError('Push notifications are not supported by your browser.');
                setIsLoading(false);
                return;
            }

            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.getSubscription();

            setIsSubscribed(!!subscription);
        } catch (err) {
            console.error('Error checking subscription:', err);
            setError('Failed to check notification status.');
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeUser = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.ready;

            // Ask user permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Notification permission denied');
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Send to backend
            const response = await apiRequest('/push/subscribe', 'POST', {
                subscription: subscription.toJSON()
            });

            if (!response.ok) throw new Error('Failed to save subscription on server');

            setIsSubscribed(true);
        } catch (err: any) {
            console.error('Failed to subscribe the user: ', err);
            setError(err.message || 'Failed to subscribe');
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribeUser = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Send removal to backend first
                await apiRequest('/push/unsubscribe', 'POST', {
                    endpoint: subscription.endpoint
                });

                // Unsubscribe locally
                await subscription.unsubscribe();
            }

            setIsSubscribed(false);
        } catch (err: any) {
            console.error('Failed to unsubscribe the user: ', err);
            setError('Failed to unsubscribe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return <div className="text-sm text-rose-500 font-medium">{error}</div>;
    }

    return (
        <button
            onClick={isSubscribed ? unsubscribeUser : subscribeUser}
            disabled={isLoading}
            className={`
                relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all overflow-hidden
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                ${isSubscribed
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30'
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:bg-indigo-500'
                }
            `}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSubscribed ? (
                <>
                    <BellOff className="w-5 h-5 transition-transform group-hover:-rotate-12" />
                    <span>Disable Daily Reminders</span>
                </>
            ) : (
                <>
                    <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    <span>Enable Daily Reminders</span>
                </>
            )}
        </button>
    );
};
