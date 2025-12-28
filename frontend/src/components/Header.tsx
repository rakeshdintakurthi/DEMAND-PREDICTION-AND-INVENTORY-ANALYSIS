import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { NotificationsPopover } from './NotificationsPopover';
import { SettingsDialog } from './SettingsDialog';

export function Header() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const username = user?.username || 'Guest';
    const initials = username.slice(0, 2).toUpperCase();

    return (
        <header className="flex h-20 items-center justify-between px-8 z-20 relative">
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm w-96 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white/80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search metrics, reports..."
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/70"
                />
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`rounded-full p-2.5 hover:bg-white/50 text-muted-foreground transition-colors relative ${showNotifications ? 'bg-white/50 text-primary' : ''}`}
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                {showNotifications && (
                    <NotificationsPopover onClose={() => setShowNotifications(false)} />
                )}

                <button
                    onClick={() => setShowSettings(true)}
                    className="rounded-full p-2.5 hover:bg-white/50 text-muted-foreground transition-colors"
                >
                    <Settings className="h-5 w-5" />
                </button>

                <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />

                <div className="pl-2 border-l border-border/50 relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-white/50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-border/40 outline-none"
                    >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md font-medium text-sm">
                            {initials}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold leading-none capitalize">{username}</p>
                            <p className="text-xs text-muted-foreground">Admin</p>
                        </div>
                    </button>

                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-white shadow-lg shadow-black/5 p-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
