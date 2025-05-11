
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateJourney } from '@/app/actions/locationIQActions';
import type { JourneyDetails } from '@/lib/types';
import { Loader2, Navigation, Clock, Pin, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function JourneyTimeTracker() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [journeyDetails, setJourneyDetails] = useState<JourneyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) {
      setError("Please enter both source and destination.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setJourneyDetails(null);

    const result = await calculateJourney(source, destination);

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
        description: `Route from ${result.sourceName} to ${result.destinationName} found.`,
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
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} sec`); // Show seconds if duration is very short or only seconds part exists
    
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
          Calculate distance and travel duration between two locations.
          Enter addresses or place names.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-address">Source</Label>
            <Input
              id="source-address"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Eiffel Tower, Paris"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination-address">Destination</Label>
            <Input
              id="destination-address"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Louvre Museum, Paris"
              disabled={isLoading}
              required
            />
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
