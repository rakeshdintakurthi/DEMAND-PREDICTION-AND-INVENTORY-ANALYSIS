import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

interface User {
    username: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, username: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("AuthProvider: Mounting...");
        const checkAuth = async () => {
            // Check local storage first
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            console.log("AuthProvider: Local Storage check", { token, username });

            if (token && username) {
                console.log("AuthProvider: User found in local storage");
                setUser({ token, username });
                setIsLoading(false);
                return;
            }

            // Check API session (Google Auth)
            try {
                console.log("AuthProvider: Checking API session...");
                const sessionUser = await api.getCurrentUser();
                console.log("AuthProvider: API session found", sessionUser);
                if (sessionUser) {
                    setUser({ token: 'oauth', username: sessionUser.email || sessionUser.name });
                }
            } catch (error) {
                console.log("AuthProvider: No API session or error", error);
            } finally {
                console.log("AuthProvider: Auth check complete, setting isLoading to false (if not already)");
                setIsLoading((prev) => {
                    if (!prev) return prev;
                    return false;
                });
            }
        };
        checkAuth();

        // Safety timeout - force load after 2 seconds if API hangs
        const timer = setTimeout(() => {
            console.log("AuthProvider: Safety timeout triggered. Forcing app load.");
            setIsLoading((prev) => {
                if (!prev) return prev;
                return false;
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const login = (token: string, username: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        setUser({ token, username });
    };

    const logout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
        // Force redirect to backend logout to clear server-side session
        window.location.href = 'http://localhost:8000/auth/logout';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading Application...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
