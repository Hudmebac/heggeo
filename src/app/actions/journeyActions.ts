
'use server';

import type { JourneyDetails } from '@/lib/types';

const NOMINATIM_API_BASE_URL = 'https://nominatim.openstreetmap.org';
const OSRM_API_BASE_URL = 'http://router.project-osrm.org'; // Public OSRM demo server

interface NominatimGeocodeResponseItem {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  boundingbox: string[];
  // Add other fields if needed based on Nominatim response
}

interface OSRMDirectionsResponse {
  code: string; // "Ok", "NoRoute", etc.
  routes: Array<{
    geometry: string | object; 
    legs: Array<{
      summary: string;
      weight: number;
      duration: number;
      steps: any[]; 
      distance: number;
    }>;
    weight_name: string;
    weight: number;
    duration: number; // in seconds
    distance: number; // in meters
  }>;
  waypoints: Array<{
    hint: string;
    distance: number;
    name: string;
    location: [number, number]; // lon, lat
  }>;
  message?: string; // Optional error message from OSRM
}

async function geocodeAddressNominatim(address: string): Promise<{ lat: string; lon: string; name: string } | null> {
  const url = `${NOMINATIM_API_BASE_URL}/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HegGeoApp/1.0 (https://heggeo.netlify.app; for_learning_purposes)', // As per Nominatim usage policy
      },
    });
    if (!response.ok) {
      console.error(`Nominatim geocoding API error for ${address}: ${response.statusText}`);
      const errorBody = await response.text();
      console.error("Nominatim Error body:", errorBody);
      return null;
    }
    const data = (await response.json()) as NominatimGeocodeResponseItem[];
    if (data && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon, name: data[0].display_name };
    }
    return null;
  } catch (error) {
    console.error(`Failed to geocode address ${address} with Nominatim:`, error);
    return null;
  }
}

export async function calculateJourneyWithNominatimAndOSRM(
  sourceAddress: string,
  destinationAddress: string
): Promise<JourneyDetails | { error: string }> {
  if (!sourceAddress || !destinationAddress) {
    return { error: 'Source and destination addresses are required.' };
  }

  const sourceGeo = await geocodeAddressNominatim(sourceAddress);
  if (!sourceGeo) {
    return { error: `Could not find coordinates for source: ${sourceAddress}` };
  }

  const destinationGeo = await geocodeAddressNominatim(destinationAddress);
  if (!destinationGeo) {
    return { error: `Could not find coordinates for destination: ${destinationAddress}` };
  }

  const coordinates = `${sourceGeo.lon},${sourceGeo.lat};${destinationGeo.lon},${destinationGeo.lat}`;
  // Using OSRM for routing
  const directionsUrl = `${OSRM_API_BASE_URL}/route/v1/driving/${coordinates}?overview=false&alternatives=false&steps=false&annotations=false`;

  try {
    const response = await fetch(directionsUrl, {
      headers: {
        'User-Agent': 'HegGeoApp/1.0 (https://heggeo.netlify.app; for_learning_purposes)',
      },
    });
    if (!response.ok) {
      console.error(`OSRM Directions API error: ${response.statusText}`);
      const errorBody = await response.text();
      console.error("OSRM Error body:", errorBody);
      return { error: `Failed to get directions from OSRM: ${response.statusText}` };
    }
    const data = (await response.json()) as OSRMDirectionsResponse;

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        sourceName: sourceGeo.name, // Use Nominatim's display_name
        destinationName: destinationGeo.name, // Use Nominatim's display_name
      };
    } else {
       const errorMessage = data.message || `No route found or API error: ${data.code}`;
      console.error("OSRM No route or error:", errorMessage, "Full OSRM response:", data);
      return { error: errorMessage };
    }
  } catch (error) {
    console.error('Failed to fetch directions from OSRM:', error);
    return { error: 'An unexpected error occurred while fetching directions using OSRM.' };
  }
}
