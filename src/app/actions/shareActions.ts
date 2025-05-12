
'use server';

const NOMINATIM_API_BASE_URL = 'https://nominatim.openstreetmap.org';

interface NominatimReverseResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: { [key: string]: string }; // Can be more specific if needed
  boundingbox: string[];
}

/**
 * Fetches a human-readable address for the given latitude and longitude.
 * @param latitude The latitude of the location.
 * @param longitude The longitude of the location.
 * @returns A promise that resolves to the address string or a fallback string/null if an error occurs.
 */
export async function getAddressFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    console.error("Invalid coordinates provided for reverse geocoding:", { latitude, longitude });
    return "Invalid coordinates provided";
  }

  const url = `${NOMINATIM_API_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
  // It's good practice to include a unique User-Agent for Nominatim.
  // See Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
  const userAgent = 'HegGeoApp/1.0 (https://heggeo.netlify.app; for_learning_purposes)';

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Nominatim reverse geocoding API error for ${latitude},${longitude}: ${response.statusText}`, errorBody);
      // Fallback to coordinates if address lookup fails
      return `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }

    const data = (await response.json()) as NominatimReverseResponse;

    if (data && data.display_name) {
      return data.display_name;
    } else {
      // Fallback if display_name is missing but request was otherwise okay
      console.warn("Nominatim response missing display_name for:", { latitude, longitude });
      return `Near coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  } catch (error) {
    console.error(`Failed to reverse geocode ${latitude},${longitude} with Nominatim:`, error);
    // Fallback in case of network or other fetch errors
    return `Error fetching address for coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}
