
"use client";

import type { Geo, UserLocation } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Link as LinkIcon, MapPin } from 'lucide-react'; // Added LinkIcon and MapPin
import { Button } from '@/components/ui/button'; // Added Button for the link

interface MapDisplayProps {
  userLocation: UserLocation | null;
  activeGeo: Geo | null;
  locationError: string | null;
}

export function MapDisplay({ userLocation, activeGeo, locationError }: MapDisplayProps) {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState<string>("No location available to display.");

  useEffect(() => {
    let url = null;
    let text = "No location available to display.";

    if (activeGeo) {
      url = `https://www.google.com/maps/@${activeGeo.latitude},${activeGeo.longitude},15z`;
      text = `Active Geo: ${activeGeo.latitude.toFixed(4)}, ${activeGeo.longitude.toFixed(4)}`;
    } else if (userLocation) {
      url = `https://www.google.com/maps/@${userLocation.latitude},${userLocation.longitude},15z`;
      text = `Your Location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`;
    }

    setMapUrl(url);
    setDisplayText(text);

  }, [activeGeo, userLocation]);

  const cardTitleIcon = (
    <MapPin className="h-6 w-6 text-primary" />
  );

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
            <p className="text-muted-foreground">{displayText}</p>
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
            <p className="text-muted-foreground">{displayText}</p>
             {userLocation === null && activeGeo === null && !locationError && (
                <p className="text-sm text-muted-foreground mt-1">Drop a Geo or enable location services.</p>
             )}
          </div>
        )}
         {locationError && (userLocation || activeGeo) && ( // If there's a location but also an error
            <div className="w-full h-full bg-muted/50 rounded-md flex flex-col items-center justify-center border border-dashed shadow-inner p-4 text-center">
                <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
                <p className="text-destructive font-semibold">Location Issue</p>
                <p className="text-sm text-muted-foreground">{locationError}</p>
                {mapUrl && (
                    <div className="mt-4 text-center space-y-2">
                        <p className="text-muted-foreground text-xs">Displaying link for: {displayText}</p>
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
