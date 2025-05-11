
'use server';

import type { JourneyDetails } from '@/lib/types';

const NOMINATIM_API_BASE_URL = 'https://nominatim.openstreetmap.org';
const OSRM_API_BASE_URL = 'http://router.project-osrm.org'; // Public OSRM demo server

interface NominatimSearchResponseItem {
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
}

interface NominatimReverseResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: { [key: string]: string };
  boundingbox: string[];
}

interface OSRMDirectionsResponse {
  code: string; 
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
    duration: number; 
    distance: number; 
  }>;
  waypoints: Array<{
    hint: string;
    distance: number;
    name: string;
    location: [number, number]; 
  }>;
  message?: string;
}

// Helper function to parse "lat,lon" strings
function parseLatLon(str: string): { lat: string; lon: string } | null {
  const parts = str.split(',');
  if (parts.length === 2) {
    const lat = parseFloat(parts[0].trim());
    const lon = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat: lat.toString(), lon: lon.toString() };
    }
  }
  return null;
}

async function geocodeAddressNominatim(addressOrCoords: string): Promise<{ lat: string; lon: string; name: string } | null> {
  const coords = parseLatLon(addressOrCoords);
  const userAgent = 'HegGeoApp/1.0 (https://heggeo.netlify.app; for_learning_purposes)';

  if (coords) {
    // It's a coordinate, perform reverse geocoding
    const url = `${NOMINATIM_API_BASE_URL}/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}&zoom=18&addressdetails=1`;
    try {
      const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
      if (!response.ok) {
        console.error(`Nominatim reverse geocoding API error for ${addressOrCoords}: ${response.statusText}`);
        const errorBody = await response.text(); 
        console.error("Nominatim Reverse Error body:", errorBody);
        // Fallback to returning coordinates as name if reverse geocoding fails or doesn't find a name
        return { lat: coords.lat, lon: coords.lon, name: `Coordinates: ${parseFloat(coords.lat).toFixed(4)}, ${parseFloat(coords.lon).toFixed(4)}` };
      }
      const data = (await response.json()) as NominatimReverseResponse;
      if (data && data.display_name) {
        // Use lat/lon from Nominatim response as it might be slightly adjusted
        return { lat: data.lat, lon: data.lon, name: data.display_name };
      }
      // Fallback if display_name is missing in a successful response
      return { lat: coords.lat, lon: coords.lon, name: `Coordinates: ${parseFloat(coords.lat).toFixed(4)}, ${parseFloat(coords.lon).toFixed(4)}` };
    } catch (error) {
      console.error(`Failed to reverse geocode ${addressOrCoords} with Nominatim:`, error);
      return { lat: coords.lat, lon: coords.lon, name: `Coordinates: ${parseFloat(coords.lat).toFixed(4)}, ${parseFloat(coords.lon).toFixed(4)}` };
    }
  } else {
    // It's an address, perform forward geocoding (search)
    const url = `${NOMINATIM_API_BASE_URL}/search?q=${encodeURIComponent(addressOrCoords)}&format=json&limit=1&addressdetails=1`;
    try {
      const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
      if (!response.ok) {
        console.error(`Nominatim search API error for ${addressOrCoords}: ${response.statusText}`);
        const errorBody = await response.text();
        console.error("Nominatim Search Error body:", errorBody);
        return null;
      }
      const data = (await response.json()) as NominatimSearchResponseItem[];
      if (data && data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon, name: data[0].display_name };
      }
      return null; // No results found
    } catch (error) {
      console.error(`Failed to geocode address ${addressOrCoords} with Nominatim:`, error);
      return null;
    }
  }
}

export async function calculateJourneyWithNominatimAndOSRM(
  sourceAddressOrCoords: string,
  destinationAddressOrCoords: string
): Promise<JourneyDetails | { error: string }> {
  if (!sourceAddressOrCoords || !destinationAddressOrCoords) {
    return { error: 'Source and destination inputs are required.' };
  }

  const sourceGeo = await geocodeAddressNominatim(sourceAddressOrCoords);
  if (!sourceGeo) {
    return { error: `Could not find coordinates for source: ${sourceAddressOrCoords}` };
  }

  const destinationGeo = await geocodeAddressNominatim(destinationAddressOrCoords);
  if (!destinationGeo) {
    return { error: `Could not find coordinates for destination: ${destinationAddressOrCoords}` };
  }

  const coordinates = `${sourceGeo.lon},${sourceGeo.lat};${destinationGeo.lon},${destinationGeo.lat}`;
  const directionsUrl = `${OSRM_API_BASE_URL}/route/v1/driving/${coordinates}?overview=false&alternatives=false&steps=false&annotations=false`;
  const userAgent = 'HegGeoApp/1.0 (https://heggeo.netlify.app; for_learning_purposes)';

  try {
    const response = await fetch(directionsUrl, { headers: { 'User-Agent': userAgent } });
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
        distance: route.distance, 
        duration: route.duration, 
        sourceName: sourceGeo.name, 
        destinationName: destinationGeo.name,
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
