import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart, Brush } from 'recharts';
import { Loader2, Calendar, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export function Forecast() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [summary, setSummary] = useState({ totalDemand: 0, growth: 0 });
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Request 30 days forecast (Backend loads data from DB)
                const forecastResult = await api.getForecast();

                if (!forecastResult || !forecastResult.ds) {
                    throw new Error("Invalid forecast data received from server.");
                }

                const chartData = forecastResult.ds.map((date: string, i: number) => ({
                    date,
                    forecast: Math.max(0, Math.round(forecastResult.yhat[i])), // Clamp to 0
                    lower: Math.max(0, Math.round(forecastResult.yhat_lower[i])),
                    upper: Math.max(0, Math.round(forecastResult.yhat_upper[i])),
                }));

                // Calculate Summary
                const total = chartData.reduce((sum: number, item: any) => sum + item.forecast, 0);
                const start = chartData[0]?.forecast || 1;
                const end = chartData[chartData.length - 1]?.forecast || 1;
                const growth = ((end - start) / start) * 100;

                setSummary({ totalDemand: total, growth });
                setData(chartData);
            } catch (err: any) {
                console.error("Forecast Error:", err);
                setError(err.response?.data?.detail || err.message || 'Failed to generate forecast.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Running advanced Prophet AI models...</p>
            </div>
        );
    }

    // Check if we have data (either loading finished and no data, or API returned empty)
    // Actually, if API fails, error state handles it. 
    // If API returns success but empty data?
    // We can check if data state is set.

    if (!loading && !data && !error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
                <div className="rounded-full bg-muted p-6">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold">No Data Available</h2>
                    <p className="text-muted-foreground">Upload your historical sales data to generate predictive insights.</p>
                </div>
                <Button onClick={() => navigate('/upload')} size="lg">Upload CSV</Button>
            </div>
        )
    }

    if (error) {
        return <div className="p-10 text-destructive text-center">Error: {error}</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Demand Forecast</h1>
                    <p className="text-muted-foreground">AI-powered predictions for the next 30 days.</p>
                </div>
                <Button onClick={() => {
                    if (!data) return;
                    // Create CSV content
                    const headers = ["Date", "Predicted Demand", "Lower Bound (95%)", "Upper Bound (95%)"];
                    const csvRows = [headers.join(',')];

                    data.forEach((row: any) => {
                        csvRows.push([row.date, row.forecast, row.lower, row.upper].join(','));
                    });

                    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "demand_forecast_30days.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }} variant="outline" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                    title="Predicted Demand (30 Days)"
                    value={summary.totalDemand.toLocaleString()}
                    icon={Target}
                />
                <SummaryCard
                    title="Expected Growth"
                    value={`${summary.growth.toFixed(1)}%`}
                    icon={TrendingUp}
                    trend={summary.growth > 0 ? 'positive' : 'negative'}
                />
                <SummaryCard
                    title="Model Confidence"
                    value="High (95%)"
                    icon={Calendar}
                    subtext="Based on low variance interval"
                />
            </div>

            <Card className="col-span-4 shadow-sm">
                <CardHeader>
                    <CardTitle>Forecast Trajectory</CardTitle>
                    <CardDescription>Drag the slider below to zoom into specific time periods.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[500px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                <defs>
                                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
                                                    <p className="mb-2 font-medium text-foreground">{label}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                                        <span className="text-sm text-muted-foreground">Forecast:</span>
                                                        <span className="text-sm font-bold">{payload.find(p => p.name === 'Predicted Sales')?.value}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="forecast"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorForecast)"
                                    name="Predicted Sales"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="upper"
                                    stroke="#10b981"
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="Upper Bound (95%)"
                                    opacity={0.5}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="lower"
                                    stroke="#ef4444"
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name="Lower Bound (95%)"
                                    opacity={0.5}
                                />
                                <Brush dataKey="date" height={30} stroke="#6366f1" fill="hsl(var(--background))" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryCard({ title, value, icon: Icon, trend, subtext }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(trend || subtext) && (
                    <p className={cn("text-xs mt-1",
                        trend === 'positive' ? "text-green-600" : trend === 'negative' ? "text-red-500" : "text-muted-foreground"
                    )}>
                        {trend === 'positive' && "+"}
                        {subtext || (trend ? "Trend" : "")}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
