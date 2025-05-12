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

export type Theme = "light" | "dark" | "hc-light" | "hc-dark";

export interface SOSSetting {
  id: string; // Unique identifier for the SOS configuration
  name: string; // User-defined name for this SOS configuration (e.g., "Hiking Emergency")
  targetPhoneNumber: string; // e.g., +11234567890
  contactDisplayName: string; // Name to use in the message body, e.g., "Emergency Contact" or "Mom"
  userName: string; // User's name, e.g., "Craig Heggie"
  defaultSituation: string; // Default message for "WHAT" part, e.g., "in Distress, need help"
  isDefault: boolean; // Whether this is the default SOS configuration to use
}
