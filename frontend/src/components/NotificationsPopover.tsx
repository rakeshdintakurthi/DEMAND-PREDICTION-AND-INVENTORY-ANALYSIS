import { Bell, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    time: string;
    read: boolean;
}

export function NotificationsPopover({ onClose }: { onClose: () => void }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Generate notifications from real data
        const alerts: Notification[] = [];
        const storedData = localStorage.getItem('salesData');

        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                // Get latest inventory for each product
                const latestInfo: Record<string, number> = {};
                data.forEach((row: any) => {
                    latestInfo[row.product] = row.inventory;
                });

                Object.entries(latestInfo).forEach(([product, inventory]) => {
                    if (inventory < 50) {
                        alerts.push({
                            id: `stock-${product}`,
                            title: 'Critical Stock Alert',
                            message: `${product} inventory is critical (${inventory} units).`,
                            type: 'warning',
                            time: 'Just now',
                            read: false
                        });
                    } else if (inventory < 150) {
                        alerts.push({
                            id: `stock-low-${product}`,
                            title: 'Low Stock Warning',
                            message: `${product} inventory is running low (${inventory} units).`,
                            type: 'info',
                            time: 'Recently',
                            read: false
                        });
                    }
                });
            } catch (e) {
                console.error("Error parsing data for notifications", e);
            }
        }

        if (alerts.length === 0) {
            alerts.push({
                id: 'system-ready',
                title: 'System Ready',
                message: 'Dashboard is active and monitoring real-time data.',
                type: 'success',
                time: 'Now',
                read: true
            });
        }

        setNotifications(alerts);
    }, []);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <div className="absolute top-16 right-20 w-80 bg-white rounded-xl shadow-2xl border border-border/50 z-50 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex gap-2">
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                    <button onClick={onClose} className="text-muted-foreground hover:bg-secondary p-1 rounded-full">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        No new notifications
                    </div>
                ) : (
                    <div className="divide-y">
                        {notifications.map(n => (
                            <div key={n.id} className={`p-4 hover:bg-secondary/30 transition-colors ${n.read ? 'opacity-60' : 'bg-blue-50/30'}`}>
                                <div className="flex gap-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === 'warning' ? 'bg-orange-500' :
                                            n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                        }`} />
                                    <div>
                                        <h4 className="text-sm font-medium leading-none mb-1">{n.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-1.5">{n.message}</p>
                                        <p className="text-[10px] text-muted-foreground/70">{n.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {notifications.length > 0 && (
                <div className="p-2 border-t bg-secondary/10">
                    <button onClick={clearAll} className="w-full text-xs text-center p-2 text-muted-foreground hover:text-primary transition-colors">
                        Clear all notifications
                    </button>
                </div>
            )}
        </div>
    );
}
