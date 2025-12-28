import { X, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const { theme, setTheme } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-background w-full max-w-md rounded-xl shadow-2xl border p-6 space-y-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Appearance */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Appearance</h3>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary'}`}
                        >
                            <Sun className="h-6 w-6" />
                            <span className="text-sm font-medium">Light</span>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary'}`}
                        >
                            <Moon className="h-6 w-6" />
                            <span className="text-sm font-medium">Dark</span>
                        </button>
                        <button
                            onClick={() => setTheme('system')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-secondary'}`}
                        >
                            <Monitor className="h-6 w-6" />
                            <span className="text-sm font-medium">System</span>
                        </button>
                    </div>
                </div>

                <div className="h-px bg-border" />

                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
