export interface Geo {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number; // Creation timestamp
  lifespan: number; // Lifespan in milliseconds
  photoUrl?: string; // Optional photo URL for sharing (Note: ShareButton now handles ad-hoc photo sharing separately)
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface JourneyDetails {
  distance: number; // in meters
  duration: number; // in seconds
  sourceName?: string;
  destinationName?: string;
}

// It seems like Label might be needed by other components, 
// adding its path here if it's considered a shared UI element type definition.
// However, typically types.ts is for data structures.
// If this is specifically for ShadCN Label, it's usually imported directly.
// For now, keeping types.ts focused on data types. If Label type is needed broadly, it can be added.
