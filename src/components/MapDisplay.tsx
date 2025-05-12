
"use client";

import type { Geo, UserLocation } from '@/lib/types';
import { useState, useEffect } from 'react'; // Added useState
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';

interface MapDisplayProps {
  userLocation: UserLocation | null;
  activeGeo: Geo | null;
  locationError: string | null;
}

const mapContainerStyle = {
  width: '100%',
  height: '20rem', // Equivalent to h-80
};

export function MapDisplay({ userLocation, activeGeo, locationError }: MapDisplayProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [mapZoom, setMapZoom] = useState<number>(2);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null); // New state for script load errors

  useEffect(() => {
    if (activeGeo) {
      setMapCenter({ lat: activeGeo.latitude, lng: activeGeo.longitude });
      setMapZoom(15);
    } else if (userLocation) {
      setMapCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
      setMapZoom(15);
    } else {
      setMapCenter({ lat: 0, lng: 0 }); // Default world view
      setMapZoom(2);
    }
  }, [activeGeo, userLocation]);

  const cardTitleIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  if (!googleMapsApiKey) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
            {cardTitleIcon}
            Interactive Map
          </CardTitle>
          <CardDescription>View your location and active Geos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 bg-muted/50 rounded-md border border-dashed p-4">
            <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive text-center font-semibold">Google Maps API Key Missing</p>
            <p className="text-center text-sm text-muted-foreground">Please configure the Google Maps API key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) in your environment variables to display the map.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display error if map script loading failed
  if (mapLoadError) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
            {cardTitleIcon}
            Interactive Map
          </CardTitle>
          <CardDescription>View your location and active Geos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 bg-muted/50 rounded-md border border-dashed p-4">
            <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive text-center font-semibold">Map Error</p>
            <p className="text-center text-sm text-muted-foreground">{mapLoadError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Display locationError if present and no map data can be shown yet and no other errors
  if (locationError && !userLocation && !activeGeo && !mapLoadError) {
     return (
      <Card className="w-full shadow-lg">
        <CardHeader>
         <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
            {cardTitleIcon}
            Interactive Map
          </CardTitle>
          <CardDescription>View your location and active Geos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80 bg-muted/50 rounded-md flex flex-col items-center justify-center border border-dashed shadow-inner p-4">
            <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive text-center font-semibold">{locationError}</p>
            <p className="text-destructive/80 text-center text-sm">Please enable location services and refresh.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
           {cardTitleIcon}
          Interactive Map
        </CardTitle>
        <CardDescription>
          View your location and active Geos on Google Maps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoadScriptNext
          googleMapsApiKey={googleMapsApiKey}
          loadingElement={<Skeleton className="w-full h-80 rounded-md" />}
          onError={(error) => {
            console.error("Google Maps script failed to load.", error);
            setMapLoadError("The map script could not be loaded. Please check the browser console for more details and verify your API key settings in Google Cloud Console.");
          }}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={mapZoom}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
            // Optional: Add an onLoad handler for the map itself if needed
            // onLoad={() => console.log("GoogleMap component loaded")}
            // Optional: Add an onUnmount handler
            // onUnmount={() => console.log("GoogleMap component unmounted")}
          >
            {userLocation && (
              <Marker 
                position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                title="Your Location" 
              />
            )}
            {activeGeo && (
              <Marker 
                position={{ lat: activeGeo.latitude, lng: activeGeo.longitude }} 
                title="Active Geo"
              />
            )}
          </GoogleMap>
        </LoadScriptNext>
        {locationError && (userLocation || activeGeo) && (
            <p className="text-destructive text-xs mt-2 text-center">
              Note: {locationError} Your current location could not be determined. Map may be centered on last known Geo.
            </p>
        )}
         {!locationError && !userLocation && !activeGeo && !mapLoadError && ( 
          // If no error, no locations, but API key IS present and maps script loaded (or at least no error from LoadScriptNext)
          // This state means GoogleMap should be trying to render. If it shows "Oops", it's a Google-side issue.
          // The h-80 here refers to the container for LoadScriptNext, which itself has a loadingElement.
          // If LoadScriptNext is still loading, its Skeleton will show. If it has loaded but GoogleMap is blank/error,
          // this message might not be visible if GoogleMap fills the space.
          // This state is unlikely to be hit if GoogleMap is correctly rendering its own error.
          <div className="w-full h-80 rounded-md flex items-center justify-center bg-muted/10 border border-dashed">
             {/* This message is a fallback; typically Google's own error message will appear if script loads but map init fails. */}
            <p className="text-muted-foreground text-sm text-center">Map initializing... If it fails to load, check your API key and console.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

