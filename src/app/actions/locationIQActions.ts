
'use server';

import type { JourneyDetails } from '@/lib/types';

const LOCATIONIQ_API_BASE_URL = 'https://us1.locationiq.com/v1';

interface GeocodeResponseItem {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

interface DirectionsResponse {
  code: string;
  routes: Array<{
    geometry: string | object; // Depending on 'geometries' option
    legs: Array<{
      summary: string;
      weight: number;
      duration: number;
      steps: any[]; // Can be more specific if steps are processed
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
    location: [number, number]; // lon, lat
  }>;
}


async function geocodeAddress(apiKey: string, address: string): Promise<{ lat: string; lon: string; name: string } | null> {
  const url = `${LOCATIONIQ_API_BASE_URL}/search?key=${apiKey}&q=${encodeURIComponent(address)}&format=json&limit=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Geocoding API error for ${address}: ${response.statusText}`);
      const errorBody = await response.text();
      console.error("Error body:", errorBody);
      return null;
    }
    const data = (await response.json()) as GeocodeResponseItem[];
    if (data && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon, name: data[0].display_name };
    }
    return null;
  } catch (error) {
    console.error(`Failed to geocode address ${address}:`, error);
    return null;
  }
}

export async function calculateJourney(
  sourceAddress: string,
  destinationAddress: string
): Promise<JourneyDetails | { error: string }> {
  const apiKey = process.env.LOCATIONIQ_ACCESS_TOKEN;

  if (!apiKey || apiKey === "YOUR_LOCATIONIQ_ACCESS_TOKEN") {
    return { error: 'LocationIQ API key is not configured. Please set LOCATIONIQ_ACCESS_TOKEN in your .env file.' };
  }
  if (!sourceAddress || !destinationAddress) {
    return { error: 'Source and destination addresses are required.' };
  }

  const sourceGeo = await geocodeAddress(apiKey, sourceAddress);
  if (!sourceGeo) {
    return { error: `Could not find coordinates for source: ${sourceAddress}` };
  }

  const destinationGeo = await geocodeAddress(apiKey, destinationAddress);
  if (!destinationGeo) {
    return { error: `Could not find coordinates for destination: ${destinationAddress}` };
  }

  const coordinates = `${sourceGeo.lon},${sourceGeo.lat};${destinationGeo.lon},${destinationGeo.lat}`;
  const directionsUrl = `${LOCATIONIQ_API_BASE_URL}/directions/driving/${coordinates}?key=${apiKey}&alternatives=false&steps=false&overview=false&annotations=false`;

  try {
    const response = await fetch(directionsUrl);
    if (!response.ok) {
      console.error(`Directions API error: ${response.statusText}`);
      const errorBody = await response.text();
      console.error("Error body:", errorBody);
      return { error: `Failed to get directions: ${response.statusText}` };
    }
    const data = (await response.json()) as DirectionsResponse;

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        sourceName: data.waypoints?.[0]?.name || sourceAddress,
        destinationName: data.waypoints?.[1]?.name || destinationAddress,
      };
    } else {
      return { error: `No route found or API error: ${data.code}` };
    }
  } catch (error) {
    console.error('Failed to fetch directions:', error);
    return { error: 'An unexpected error occurred while fetching directions.' };
  }
}
