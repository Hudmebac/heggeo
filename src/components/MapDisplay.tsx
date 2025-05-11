"use client";

import type { Geo, UserLocation } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, UserCircle2, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MapDisplayProps {
  userLocation: UserLocation | null;
  activeGeo: Geo | null;
  locationError: string | null;
}

export function MapDisplay({ userLocation, activeGeo, locationError }: MapDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (activeGeo) {
      const calculateTime = () => {
        const endTime = activeGeo.timestamp + activeGeo.lifespan;
        const diff = endTime - Date.now();
        if (diff <= 0) {
          setTimeRemaining("Expired");
        } else {
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeRemaining(`${minutes}m ${seconds}s left`);
        }
      };
      calculateTime();
      const interval = setInterval(calculateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [activeGeo]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
          Interactive Map
        </CardTitle>
        <CardDescription>
          View your location and active Geos. (Placeholder)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          data-ai-hint="abstract map pattern"
          className="relative w-full h-64 sm:h-80 bg-muted/50 rounded-md flex items-center justify-center overflow-hidden border border-dashed shadow-inner"
          aria-label="Map placeholder"
        >
          {locationError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 p-4">
              <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
              <p className="text-destructive text-center font-semibold">{locationError}</p>
              <p className="text-destructive/80 text-center text-sm">Please enable location services.</p>
            </div>
          )}
          {!locationError && !userLocation && !activeGeo && (
            <p className="text-muted-foreground">Loading map data...</p>
          )}

          {userLocation && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: '50%', left: '50%' }}
              title={`Your Location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
            >
              <UserCircle2 className="h-8 w-8 text-blue-500" />
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs bg-background px-1 rounded">You</span>
            </div>
          )}

          {activeGeo && (
             <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 p-0 h-auto w-auto"
                  style={{ 
                    top: userLocation && (activeGeo.latitude !== userLocation.latitude || activeGeo.longitude !== userLocation.longitude) ? '30%' : '50%', // Offset if user location is different
                    left: userLocation && (activeGeo.latitude !== userLocation.latitude || activeGeo.longitude !== userLocation.longitude) ? '70%' : '50%' 
                  }}
                  title={`Active Geo: ${activeGeo.latitude.toFixed(4)}, ${activeGeo.longitude.toFixed(4)}`}
                >
                  <MapPin className="h-10 w-10 text-primary animate-bounce" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 text-sm">
                <p className="font-semibold">Active Geo</p>
                <p>{timeRemaining}</p>
              </PopoverContent>
            </Popover>
          )}
           {!activeGeo && userLocation && (
             <p className="text-muted-foreground text-sm mt-24">No active Geo. Drop one!</p>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
