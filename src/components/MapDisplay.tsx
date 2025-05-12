
"use client";

import type { Geo, UserLocation } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Link as LinkIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAddressFromCoordinates } from '@/app/actions/shareActions';
import { Skeleton } from '@/components/ui/skeleton';

interface MapDisplayProps {
  userLocation: UserLocation | null;
  activeGeo: Geo | null;
  locationError: string | null;
}

export function MapDisplay({ userLocation, activeGeo, locationError }: MapDisplayProps) {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState<string>("No location available to display.");
  const [activeGeoAddress, setActiveGeoAddress] = useState<string | null>(null);
  const [isFetchingActiveGeoAddress, setIsFetchingActiveGeoAddress] = useState<boolean>(false);

  useEffect(() => {
    let url = null;
    let text = "No location available to display.";

    const fetchActiveGeoAddress = async () => {
      if (activeGeo) {
        setIsFetchingActiveGeoAddress(true);
        setActiveGeoAddress(null);
        try {
          const address = await getAddressFromCoordinates(activeGeo.latitude, activeGeo.longitude);
          const fetchedAddr = address || `Coordinates: ${activeGeo.latitude.toFixed(4)}, ${activeGeo.longitude.toFixed(4)}`;
          setActiveGeoAddress(fetchedAddr);
          setDisplayText(`Active Geo: ${fetchedAddr}`);
        } catch (error) {
          console.error("Error fetching address for MapDisplay (ActiveGeo):", error);
          const errorAddr = `Error fetching address for ${activeGeo.latitude.toFixed(4)}, ${activeGeo.longitude.toFixed(4)}`;
          setActiveGeoAddress(errorAddr);
          setDisplayText(`Active Geo: ${errorAddr}`);
        } finally {
          setIsFetchingActiveGeoAddress(false);
        }
      }
    };

    if (activeGeo) {
      url = `https://www.google.com/maps/@${activeGeo.latitude},${activeGeo.longitude},15z`;
      fetchActiveGeoAddress(); // Fetch address and update display text
    } else if (userLocation) {
      url = `https://www.google.com/maps/@${userLocation.latitude},${userLocation.longitude},15z`;
      // Optionally, fetch address for userLocation too, or keep as coordinates
      text = `Your Location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
      setDisplayText(text);
      setActiveGeoAddress(null); // No active geo, so no active geo address
    } else {
      setDisplayText("No location available to display.");
      setActiveGeoAddress(null);
    }
    setMapUrl(url);

  }, [activeGeo, userLocation]);

  const cardTitleIcon = (
    <MapPin className="h-6 w-6 text-primary" />
  );

  // Use a refined displayText for the <p> tag to include loading state
  const currentDisplayMessage = () => {
    if (activeGeo) {
      if (isFetchingActiveGeoAddress) return "Fetching Active Geo address...";
      return activeGeoAddress ? `Active Geo: ${activeGeoAddress}` : `Active Geo: ${activeGeo.latitude.toFixed(4)}, ${activeGeo.longitude.toFixed(4)}`;
    }
    if (userLocation) {
      return `Your Location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
    }
    return "No location available to display.";
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
           {cardTitleIcon}
          Location Link
        </CardTitle>
        <CardDescription>
          Link to view your location or active Geo on Google Maps.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80 flex flex-col items-center justify-center">
        {locationError && !userLocation && !activeGeo && (
          <div className="w-full h-full bg-muted/50 rounded-md flex flex-col items-center justify-center border border-dashed shadow-inner p-4 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive font-semibold">{locationError}</p>
            <p className="text-destructive/80 text-sm">Please enable location services and refresh.</p>
          </div>
        )}

        {!locationError && mapUrl && (
          <div className="text-center space-y-4">
            {isFetchingActiveGeoAddress && activeGeo ? (
                <Skeleton className="h-5 w-48" />
            ) : (
                <p className="text-muted-foreground break-words max-w-xs">{currentDisplayMessage()}</p>
            )}
            <Button asChild variant="secondary">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Open in Google Maps
              </a>
            </Button>
          </div>
        )}

        {!locationError && !mapUrl && (
           <div className="w-full h-full bg-muted/50 rounded-md flex flex-col items-center justify-center border border-dashed shadow-inner p-4 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{currentDisplayMessage()}</p>
             {userLocation === null && activeGeo === null && !locationError && (
                <p className="text-sm text-muted-foreground mt-1">Drop a Geo or enable location services.</p>
             )}
          </div>
        )}
         {locationError && (userLocation || activeGeo) && (
            <div className="w-full h-full bg-muted/50 rounded-md flex flex-col items-center justify-center border border-dashed shadow-inner p-4 text-center">
                <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-destructive font-semibold">Location Issue</p>
                <p className="text-sm text-muted-foreground">{locationError}</p>
                {mapUrl && (
                    <div className="mt-4 text-center space-y-2">
                        {isFetchingActiveGeoAddress && activeGeo ? (
                            <Skeleton className="h-4 w-40" />
                        ) : (
                           <p className="text-muted-foreground text-xs break-words max-w-xs">Displaying link for: {currentDisplayMessage()}</p>
                        )}
                        <Button asChild variant="secondary">
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            Open in Google Maps
                        </a>
                        </Button>
                    </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
