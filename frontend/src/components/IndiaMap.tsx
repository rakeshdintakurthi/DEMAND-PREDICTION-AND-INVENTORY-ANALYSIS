import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';

// Coordinates for regions
const REGION_COORDS: Record<string, [number, number]> = {
    // Major Cities
    'Delhi': [28.6139, 77.2090],
    'New Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Bangalore': [12.9716, 77.5946],
    'Bengaluru': [12.9716, 77.5946],
    'Hyderabad': [17.3850, 78.4867],
    'Kolkata': [22.5726, 88.3639],
    'Chennai': [13.0827, 80.2707],
    'Pune': [18.5204, 73.8567],
    'Ahmedabad': [23.0225, 72.5714],
    'Jaipur': [26.9124, 75.7873],
    'Surat': [21.1702, 72.8311],
    'Lucknow': [26.8467, 80.9462],
    'Kanpur': [26.4499, 80.3319],
    'Nagpur': [21.1458, 79.0882],
    'Indore': [22.7196, 75.8577],
    'Thane': [19.2183, 72.9781],
    'Bhopal': [23.2599, 77.4126],
    'Visakhapatnam': [17.6868, 83.2185],
    'Patna': [25.5941, 85.1376],
    'Vadodara': [22.3072, 73.1812],
    'Ghaziabad': [28.6692, 77.4538],
    'Ludhiana': [30.9010, 75.8573],
    'Agra': [27.1767, 78.0081],
    'Nashik': [19.9975, 73.7898],

    // Regions (Mapping to main hub)
    'North': [28.6139, 77.2090], // Delhi
    'South': [12.9716, 77.5946], // Bangalore
    'East': [22.5726, 88.3639], // Kolkata
    'West': [19.0760, 72.8777], // Mumbai
};

const PRODUCT_COLORS: Record<string, string> = {
    // Vibrant distinct palette 
    'Smartphone': '#ef4444', // Red
    'Laptop': '#3b82f6',     // Blue
    'Headphones': '#f59e0b', // Amber/Orange (Distinct from Green)
    'Smartwatch': '#10b981', // Emerald Green
    'Tablet': '#8b5cf6',     // Violet
    'Camera': '#ec4899',     // Pink
    'Printer': '#6366f1',    // Indigo
    'Monitor': '#14b8a6',    // Teal
    'Speaker': '#f97316',    // Deep Orange
    'default': '#64748b'     // Slate
};

function getProductColor(productName: string) {
    // Simple hash to pick color if not in predefined list
    if (PRODUCT_COLORS[productName]) return PRODUCT_COLORS[productName];

    const colors = Object.values(PRODUCT_COLORS);
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
        hash = productName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

interface ProductDemand {
    product: string;
    units: number;
}

interface RegionData {
    region: string;
    demand: number;
    products?: ProductDemand[];
}

interface IndiaMapProps {
    data: RegionData[];
}

export function IndiaMap({ data }: IndiaMapProps) {
    const center: [number, number] = [20.5937, 78.9629]; // Center of India

    // Flatten data to get all product points
    const mapPoints = useMemo(() => {
        const points: { region: string; product: string; units: number; lat: number; lng: number }[] = [];

        data.forEach(regionItem => {
            const baseCoords = REGION_COORDS[regionItem.region];
            if (!baseCoords) return;

            if (regionItem.products && regionItem.products.length > 0) {
                // Determine max units in this region to scale offset
                // Distribute points around the center
                regionItem.products.forEach((prod, index) => {
                    // Create a small random/spiral offset so dots don't overlap
                    const angle = index * (Math.PI * 2 / Math.min(regionItem.products!.length, 8)) + (index > 8 ? 0.5 : 0);
                    const radiusOffset = 0.5 + (index * 0.15); // Spiral out effect

                    // Simple distinct offset based on index to be deterministic
                    const latOffset = (Math.cos(angle) * (1 + radiusOffset));
                    const lngOffset = (Math.sin(angle) * (1 + radiusOffset));

                    points.push({
                        region: regionItem.region,
                        product: prod.product,
                        units: prod.units,
                        lat: baseCoords[0] + latOffset,
                        lng: baseCoords[1] + lngOffset
                    });
                });
            } else {
                // Fallback for aggregate if no product data
                points.push({
                    region: regionItem.region,
                    product: 'Total Code',
                    units: regionItem.demand,
                    lat: baseCoords[0],
                    lng: baseCoords[1]
                });
            }
        });
        return points;
    }, [data]);

    const maxUnits = useMemo(() => Math.max(...mapPoints.map(p => p.units), 1), [mapPoints]);

    return (
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {mapPoints.map((point, idx) => {
                // Scale radius
                const radius = 8 + (point.units / maxUnits) * 20;
                const color = getProductColor(point.product);

                return (
                    <CircleMarker
                        key={`${point.region}-${point.product}-${idx}`}
                        center={[point.lat, point.lng]}
                        pathOptions={{ color: color, fillColor: color, fillOpacity: 0.7, weight: 1 }}
                        radius={radius}
                    >
                        <Popup>
                            <div className="text-center min-w-[120px]">
                                <h4 className="font-bold text-sm text-muted-foreground">{point.region}</h4>
                                <h3 className="font-bold text-lg" style={{ color: color }}>{point.product}</h3>
                                <p className="text-sm font-medium">{point.units.toLocaleString()} units</p>
                            </div>
                        </Popup>
                        <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                            {point.product}: {point.units}
                        </Tooltip>
                    </CircleMarker>
                );
            })}

            {/* Legend Overlay */}
            <div className="leaflet-bottom leaflet-right">
                <div className="leaflet-control leaflet-bar bg-white/90 p-3 rounded-lg shadow-lg backdrop-blur-sm m-4 max-h-[200px] overflow-y-auto">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Products</h4>
                    <div className="space-y-1">
                        {Array.from(new Set(mapPoints.map(p => p.product))).map(prod => (
                            <div key={prod} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getProductColor(prod) }} />
                                <span>{prod}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MapContainer>
    );
}
