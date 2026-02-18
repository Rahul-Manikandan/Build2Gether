export interface Report {
    id: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    imageUrl: string;
    timestamp: string;
    status: 'pending' | 'reviewed' | 'resolved';
    synced: boolean;
}
