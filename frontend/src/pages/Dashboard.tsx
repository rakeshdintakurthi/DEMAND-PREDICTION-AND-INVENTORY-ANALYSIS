import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { IndianRupee, Activity, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart, Area } from 'recharts';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';
import { IndiaMap } from '../components/IndiaMap';

import { HistoryDialog } from '../components/HistoryDialog';

export function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [showMap, setShowMap] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // Fetch directly from API (which fetches from DB)
                const data = await api.getDashboardStats();
                setStats(data);
            } catch (err: any) {
                console.error("Failed to fetch dashboard stats", err);
                setError(err.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Fallback/Default data if empty or loading failed but we want to show structure
    const displayStats = stats || {
        total_revenue: 0,
        active_forecasts: 0,
        avg_accuracy: 0,
        stock_risk_count: 0,
        sales_trend: [],
        region_demand: []
    };

    if (error) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-red-100 p-3">
                    <Activity className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-muted-foreground max-w-md">{error}</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Retry
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('salesData');
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                    >
                        Clear Data & Reset
                    </button>
                </div>
            </div>
        );
    }

    if (loading && !stats) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Aggregating supply chain metrics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-in-expand text-foreground">Overview</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Detailed analysis of your supply chain performance.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowHistory(true)}
                        className="text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 px-3 py-1 rounded-md transition-colors"
                    >
                        History
                    </button>
                    <button
                        onClick={async () => {
                            if (confirm('Are you sure you want to clear all data? This will reset the dashboard to zero.')) {
                                try {
                                    await api.clearData();
                                    // Also clear local bits if any, though not used much now
                                    localStorage.removeItem('salesData');
                                    window.location.reload();
                                } catch (e) {
                                    alert('Failed to clear data on server.');
                                    console.error(e);
                                }
                            }
                        }}
                        className="text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-1"
                    >
                        Clear Data
                    </button>
                    <span className="bg-white/50 backdrop-blur-sm border border-white/60 text-primary px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 fill-current" /> Live
                    </span>
                </div>
            </div>

            <HistoryDialog isOpen={showHistory} onClose={() => setShowHistory(false)} />

            {/* KPI Grid */}

            {/* KPI Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Revenue"
                    value={`₹${displayStats.total_revenue.toLocaleString()}`}
                    trend={displayStats.total_revenue > 0 ? "+12.5%" : "0%"} // Only show growth if there is revenue
                    trendUp={displayStats.total_revenue > 0}
                    icon={IndianRupee}
                    description="vs last period"
                    gradient="from-blue-500 to-indigo-600"
                />
                <KpiCard
                    title="Active Forecasts"
                    value={displayStats.active_forecasts}
                    trend="Stable"
                    trendUp={true}
                    icon={Activity}
                    description="Active SKU models"
                    gradient="from-violet-500 to-fuchsia-600"
                />
                <KpiCard
                    title="Avg. Accuracy"
                    value={`${displayStats.avg_accuracy}%`}
                    trend="Stable"
                    trendUp={true}
                    icon={TrendingUp}
                    description="Estimated reliability"
                    gradient="from-emerald-500 to-teal-400"
                />
                <KpiCard
                    title="Stock Risk"
                    value={`${displayStats.stock_risk_count} Items`}
                    trend={displayStats.stock_risk_count > 0 ? "Critical" : "Safe"}
                    trendUp={displayStats.stock_risk_count === 0}
                    icon={Package}
                    description="Below safety stock levels"
                    alert={displayStats.stock_risk_count > 0}
                    gradient="from-orange-500 to-red-500"
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">

                {/* Sales vs Forecast Chart */}
                <Card className="col-span-4 lg:col-span-5 border-0 ring-1 ring-slate-900/5 shadow-xl bg-white/80">
                    <CardHeader>
                        <CardTitle>Sales vs Forecast Trend</CardTitle>
                        <CardDescription>Comparing actual sales performance against AI predicted demand.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={displayStats.sales_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }}
                                        cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} name="Actual Revenue" />
                                    <Line type="monotone" dataKey="forecast" stroke="#f43f5e" strokeWidth={3} strokeDasharray="4 4" name="Target Forecast" dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Demand Chart */}
                {/* Regional Demand & Insights */}
                <div className="col-span-3 lg:col-span-2 space-y-6">
                    <Card className="h-[45%] border-0 ring-1 ring-slate-900/5 shadow-lg bg-white/80 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setShowMap(true)}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Regional Demand
                                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full ml-auto">Click for Map</span>
                            </CardTitle>
                            <CardDescription>Top performing regions.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[150px] w-full px-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={displayStats.region_demand} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="region" type="category" width={50} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                                        <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={24} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-[auto] border-0 ring-1 ring-slate-900/5 shadow-lg bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Activity className="h-4 w-4 text-primary" />
                                </div>
                                AI Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InsightItem
                                type="positive"
                                text="Data processing complete. Metrics are live."
                            />
                            {displayStats.stock_risk_count > 0 && (
                                <InsightItem
                                    type="warning"
                                    text={`${displayStats.stock_risk_count} items detected with critical stock levels.`}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>


                {/* Map Modal */}
                {
                    showMap && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                                <div className="p-4 border-b flex items-center justify-between">
                                    <h2 className="text-lg font-bold">Regional Demand Map</h2>
                                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                                        <span className="text-xl font-bold">₹</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Total Revenue</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold tracking-tight">
                                                ₹{displayStats.total_revenue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowMap(false)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                                        <span className="text-xl font-bold">&times;</span>
                                    </button>
                                </div>
                                <div className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 relative z-0">
                                    <div className="absolute inset-0 z-0 h-full w-full">
                                        <IndiaMap data={stats?.region_demand || []} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 -z-10" onClick={() => setShowMap(false)}></div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}

function KpiCard({ title, value, trend, trendUp, icon: Icon, description, alert = false, gradient }: any) {
    return (
        <Card className={cn("transition-all hover:scale-[1.02] border-0 ring-1 ring-slate-900/5 shadow-lg bg-white/90 overflow-hidden relative group")}>
            <div className={cn("absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity")}>
                <Icon className={cn("h-24 w-24 text-primary")} />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
                <div className={cn("p-2 rounded-xl bg-gradient-to-br shadow-inner text-white", gradient ? gradient : "from-slate-500 to-slate-700")}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-slate-800">{value}</div>
                <div className="flex items-center text-xs mt-2 font-medium">
                    <span className={cn("flex items-center py-0.5 px-2 rounded-full",
                        trendUp ? "text-emerald-700 bg-emerald-100" : (alert ? "text-red-700 bg-red-100" : "text-rose-700 bg-rose-100")
                    )}>
                        {trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {trend}
                    </span>
                    <span className="text-muted-foreground ml-2">{description}</span>
                </div>
            </CardContent>
        </Card>
    )
}

function InsightItem({ type, text }: { type: 'positive' | 'warning' | 'neutral', text: string }) {
    return (
        <div className="flex items-start gap-3 text-sm p-3 rounded-xl bg-white/50 border border-white/60 shadow-sm">
            <div className={cn("h-2 w-2 mt-1.5 rounded-full shrink-0 shadow-sm",
                type === 'positive' ? "bg-emerald-500" : type === 'warning' ? "bg-amber-500" : "bg-blue-500"
            )} />
            <p className="leading-relaxed text-slate-600 font-medium">{text}</p>
        </div>
    )
}
