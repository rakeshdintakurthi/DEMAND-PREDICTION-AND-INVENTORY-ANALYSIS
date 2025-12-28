import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Inventory() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch directly from Backend (which loads from DB)
                const result = await api.getInventoryPlan();

                if (!result) throw new Error("No inventory data received");

                const enhancedResult = result.map((p: any) => {
                    // Map backend status to frontend status
                    let status = 'Healthy';
                    let riskLevel = 'Low';

                    if (p.current_stock_status === 'Critical') {
                        status = 'Reorder';
                        riskLevel = 'High';
                    } else if (p.current_stock_status === 'Low') {
                        status = 'Warning';
                        riskLevel = 'Medium';
                    }

                    return {
                        ...p,
                        current_stock: p.current_stock_level,
                        status,
                        riskLevel
                    };
                });

                setPlans(enhancedResult);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.detail || 'Failed to calculate inventory plan.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("Inventory Intelligence Report", 14, 20);

        // Date
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        // Table
        const tableColumn = ["Product ID", "Current Stock", "ROP", "Safety Stock", "EOQ", "Status"];
        const tableRows = plans.map(plan => [
            plan.product,
            plan.current_stock,
            plan.reorder_point,
            plan.safety_stock,
            plan.eoq,
            plan.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo color
        });

        // Summary Calculation
        const totalSKUs = plans.length;
        const reorderCount = plans.filter(p => p.status === 'Reorder').length;
        const warningCount = plans.filter(p => p.status === 'Warning').length;
        const healthyCount = plans.filter(p => p.status === 'Healthy').length;

        // Add Summary Section
        // Get the Y position where the table ended
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(14);
        doc.text("Executive Summary", 14, finalY);

        doc.setFontSize(11);
        doc.text(`Total Products Analyzed: ${totalSKUs}`, 14, finalY + 8);
        doc.text(`Products Needing Attention: ${reorderCount + warningCount}`, 14, finalY + 14);

        // Detailed breakdown
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`• Critical Reorders: ${reorderCount}`, 20, finalY + 20);
        doc.text(`• Low Stock Warnings: ${warningCount}`, 20, finalY + 25);
        doc.text(`• Healthy Stock Status: ${healthyCount}`, 20, finalY + 30);

        doc.save("inventory-plan.pdf");
    };

    if (loading) return <LoadingState />;
    if (!loading && plans.length === 0 && !error) return <EmptyState navigate={navigate} />;
    if (error) return <ErrorState error={error} />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Intelligence</h1>
                    <p className="text-muted-foreground">AI-optimized stock levels and reorder recommendations.</p>
                </div>
                <Button onClick={exportToPDF}>Export Plan</Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>SKU Performance & Reorder Analysis</CardTitle>
                    <CardDescription>Real-time analysis based on projected demand.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Product ID</th>
                                    <th className="px-6 py-4">Current Stock</th>
                                    <th className="px-6 py-4">Reorder Point (ROP)</th>
                                    <th className="px-6 py-4">Safety Stock</th>
                                    <th className="px-6 py-4">Rec. Order Qty (EOQ)</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {plans.map((plan) => (
                                    <tr key={plan.product} className="bg-card hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{plan.product}</td>
                                        <td className="px-6 py-4 font-bold">{plan.current_stock}</td>
                                        <td className="px-6 py-4">{plan.reorder_point}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{plan.safety_stock}</td>
                                        <td className="px-6 py-4">{plan.eoq}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={plan.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {plan.riskLevel === 'High' ? (
                                                <Button size="sm" variant="destructive" className="h-7 px-2">Order Now</Button>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">--</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 items-start border border-blue-100 dark:border-blue-900/50">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">How is this calculated?</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            Reorder Points are derived from your daily demand volatility and a 95% service level target.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'Reorder') {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Reorder
        </span>
    }
    if (status === 'Warning') {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
            <Info className="w-3 h-3 mr-1" /> Low Stock
        </span>
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
        <CheckCircle className="w-3 h-3 mr-1" /> Healthy
    </span>
}

function LoadingState() {
    return (
        <div className="flex h-[80vh] justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="ml-3 text-lg font-medium text-muted-foreground">Analyzing inventory risks...</span>
        </div>
    );
}

function EmptyState({ navigate }: { navigate: any }) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <h2 className="text-xl font-semibold">No Inventory Data</h2>
            <p className="text-muted-foreground">Upload sales data to generate an inventory plan.</p>
            <Button onClick={() => navigate('/upload')}>Go to Upload</Button>
        </div>
    )
}

function ErrorState({ error }: { error: string }) {
    return <div className="p-10 text-destructive text-center">Error: {error}</div>;
}
