import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, TrendingUp, Package, BarChart3, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Predictions', href: '/forecast', icon: TrendingUp },
    { name: 'Analysis', href: '/analysis', icon: BarChart3 },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Import Data', href: '/upload', icon: UploadCloud },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="hidden md:flex h-screen w-72 flex-col p-4 bg-background">
            <div className="flex flex-col h-full rounded-2xl bg-card/50 border border-white/20 shadow-xl backdrop-blur-xl">

                {/* Logo Section */}
                <div className="flex h-24 items-center px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 shadow-lg shadow-primary/30">
                            <PieChart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="block text-lg font-bold tracking-tight text-foreground">DemandAI</span>
                            <span className="block text-xs font-medium text-muted-foreground tracking-wide">INTELLIGENCE</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
                    <p className="px-4 text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Analytics</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ease-out",
                                location.pathname === item.href
                                    ? "bg-gradient-to-r from-primary/10 to-transparent text-primary shadow-sm ring-1 ring-primary/20 translate-x-1"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 transition-colors", location.pathname === item.href ? "text-primary" : "group-hover:text-foreground")} />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Footer Card */}
                <div className="p-4 mt-auto">
                    <div className="rounded-xl bg-gradient-to-br from-primary to-violet-600 p-5 text-white shadow-lg shadow-primary/25 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-full bg-white/20 blur-xl group-hover:bg-white/30 transition-colors"></div>
                        <h4 className="font-bold relative z-10">Pro Insights</h4>
                        <p className="text-xs text-blue-100 mt-1 relative z-10 font-medium">Get 95% forecast accuracy with our new AI model.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
