import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { api } from '../services/api';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, Package, TrendingUp, AlertTriangle } from 'lucide-react';

export function ProductAnalysis() {
    const [products, setProducts] = useState<string[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch active products from the current dataset
                const productList = await api.getProducts();
                setProducts(productList);
                if (productList.length > 0) {
                    setSelectedProduct(productList[0]);
                }
            } catch (err) {
                console.error("Failed to load products for analysis", err);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            if (!selectedProduct) return;
            setLoading(true);
            try {
                // Call API without passing data
                const stats = await api.getProductStats(selectedProduct);
                setStats(stats);
            } catch (err) {
                console.error("Failed to fetch product stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedProduct]);

    if (!selectedProduct) return <div className="p-8 text-center text-muted-foreground">Please upload data to view analysis.</div>;

    const stockColor = stats?.stock_status === 'Critical' ? 'text-red-500' : (stats?.stock_status === 'Low' ? 'text-orange-500' : 'text-green-500');

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Analysis</h1>
                    <p className="text-muted-foreground">Deep dive into individual product performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Select Product:</span>
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                        {products.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading || !stats ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                    <span className="text-xs font-bold">₹</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹{stats.total_revenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Lifetime sales</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.current_stock} <span className="text-sm font-normal text-muted-foreground">units</span></div>
                                <div className={`text-xs font-medium flex items-center gap-1 ${stockColor}`}>
                                    {stats.stock_status === 'Critical' && <AlertTriangle className="h-3 w-3" />}
                                    Status: {stats.stock_status}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Units Sold</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_units}</div>
                                <p className="text-xs text-muted-foreground">Volume moved</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Sales Trend</CardTitle>
                                <CardDescription>Daily revenue performance over time.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={stats.daily_trend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                                            <YAxis />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                            />
                                            <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
                                            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} dot={false} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Regional Breakdown</CardTitle>
                                <CardDescription>Where this product is selling the most.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.regional_breakdown} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="region" type="category" width={60} />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="units" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
