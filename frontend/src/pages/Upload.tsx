import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export function Upload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
            setSuccess(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const data = await api.uploadData(file);
            // Store data in localStorage for demo simplicity
            localStorage.setItem('salesData', JSON.stringify(data));
            setSuccess(true);
            setTimeout(() => navigate('/forecast'), 1500);
        } catch (err: any) {
            console.error(err);
            const detail = err.response?.data?.detail;
            const status = err.response?.status;
            setError(detail ? `Server Error (${status}): ${detail}` : `Connection Error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-10">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Upload Sales Data</h1>
                <p className="text-muted-foreground">
                    Upload your historical sales CSV or Excel file to generate forecasts.
                </p>
            </div>

            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle>File Upload</CardTitle>
                    <CardDescription>
                        Expected columns: date, amount, product_id (optional), region (optional)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
                            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                            file ? "bg-muted/30" : ""
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-4 rounded-full bg-background border shadow-sm">
                                <UploadCloud className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium">
                                    {file ? file.name : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase">
                                    {file ? (file.size / 1024).toFixed(2) + " KB" : "CSV or Excel (Max 10MB)"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 p-3 rounded-md">
                            <CheckCircle className="h-4 w-4" />
                            Upload successful! Redirecting...
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setFile(null)} disabled={!file || uploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={!file || uploading}>
                            {uploading ? "Processing..." : "Analyze Data"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="max-w-xl text-xs text-muted-foreground text-center">
                <p>Sample format: 2023-01-01,150.50,Product_A,North</p>
            </div>
        </div>
    );
}
