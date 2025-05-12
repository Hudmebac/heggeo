
"use client";

import type { UserLocation } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateJourneyWithNominatimAndOSRM } from '@/app/actions/journeyActions';
import type { JourneyDetails } from '@/lib/types';
import { Loader2, Navigation, Clock, Pin, AlertTriangle, LocateFixed } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface JourneyTimeTrackerProps {
  userLocation: UserLocation | null;
  locationError: string | null;
}

export function JourneyTimeTracker({ userLocation, locationError }: JourneyTimeTrackerProps) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [journeyDetails, setJourneyDetails] = useState<JourneyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUseMyLocation = (fieldType: 'source' | 'destination') => {
    if (userLocation) {
      const latLonString = `${userLocation.latitude},${userLocation.longitude}`;
      if (fieldType === 'source') {
        setSource(latLonString);
      } else {
        setDestination(latLonString);
      }
      setError(null); // Clear previous errors as user provided new input
       toast({
        title: "Location Set",
        description: `Current location used for ${fieldType}.`,
      });
    } else {
      toast({
        title: "Location Unavailable",
        description: locationError || "Could not retrieve your current location. Please enable location services and try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) {
      setError("Please enter both source and destination locations.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setJourneyDetails(null);

    const result = await calculateJourneyWithNominatimAndOSRM(source, destination);

    if ('error' in result) {
      setError(result.error);
      toast({
        title: "Journey Calculation Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setJourneyDetails(result);
      toast({
        title: "Journey Calculated!",
        description: `Route from ${result.sourceName || source} to ${result.destinationName || destination} found.`,
      });
    }
    setIsLoading(false);
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(1)} meters`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    let parts: string[] = [];
    if (hours > 0) parts.push(`${hours} hr`);
    if (minutes > 0) parts.push(`${minutes} min`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec`); 
    
    return parts.join(' ');
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
          <Navigation className="h-6 w-6 text-primary" />
          Journey Time Tracker
        </CardTitle>
        <CardDescription>
          Calculate distance and travel duration. Enter addresses, place names, coordinates (lat,lon), or use your current location. Powered by OpenStreetMap.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-address">Source Location</Label>
            <div className="flex items-center gap-2">
              <Input
                id="source-address"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Address, Place, Postcode..."
                disabled={isLoading}
                required
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleUseMyLocation('source')}
                disabled={isLoading || !userLocation || !!locationError}
                aria-label="Use my current location for source"
                title="Use my current location for source"
              >
                <LocateFixed className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination-address">Destination Location</Label>
            <div className="flex items-center gap-2">
              <Input
                id="destination-address"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Address, Place, Postcode..."
                disabled={isLoading}
                required
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleUseMyLocation('destination')}
                disabled={isLoading || !userLocation || !!locationError}
                aria-label="Use my current location for destination"
                title="Use my current location for destination"
              >
                <LocateFixed className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="mr-2 h-4 w-4" />
            )}
            Calculate Journey
          </Button>
        </CardFooter>
      </form>

      {error && (
        <CardContent>
          <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      )}

      {journeyDetails && !error && (
        <CardContent className="space-y-3 pt-4 border-t mt-4">
          <h3 className="text-lg font-semibold font-orbitron tracking-wide">Journey Details:</h3>
          <div className="text-sm space-y-2">
            <p className="flex items-center">
              <Pin className="h-4 w-4 mr-2 text-secondary" />
              <strong>Source:</strong>&nbsp;{journeyDetails.sourceName || source}
            </p>
            <p className="flex items-center">
              <Pin className="h-4 w-4 mr-2 text-secondary" />
              <strong>Destination:</strong>&nbsp;{journeyDetails.destinationName || destination}
            </p>
            <p className="flex items-center">
              <Navigation className="h-4 w-4 mr-2 text-secondary" />
              <strong>Distance:</strong>&nbsp;{formatDistance(journeyDetails.distance)}
            </p>
            <p className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-secondary" />
              <strong>Duration:</strong>&nbsp;{formatDuration(journeyDetails.duration)}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

