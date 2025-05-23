export interface Geo {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number; // Creation timestamp
  lifespan: number; // Lifespan in milliseconds. Can be Infinity for no expiry. (JSON.stringify(Infinity) results in null)
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

export type SharePlatform = 'whatsapp' | 'twitter' | 'linkedin' | 'pinterest' | 'facebook' | 'copy';
