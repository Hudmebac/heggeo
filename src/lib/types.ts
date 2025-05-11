export interface Geo {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number; // Creation timestamp
  lifespan: number; // Lifespan in milliseconds
  photoUrl?: string; // Optional photo URL for sharing
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
