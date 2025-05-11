"use client";

import type { Geo, UserLocation } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeoDropFormProps {
  userLocation: UserLocation | null;
  activeGeo: Geo | null;
  onDropGeo: (lifespan: number) => void;
  onClearGeo: () => void;
}

const MIN_LIFESPAN_MINUTES = 5;
const MAX_LIFESPAN_MINUTES = 120; // 2 hours

export function GeoDropForm({ userLocation, activeGeo, onDropGeo, onClearGeo }: GeoDropFormProps) {
  const [sliderValue, setSliderValue] = useState([25]); // Default to ~30 mins (25% of range)
  const [lifespanMinutes, setLifespanMinutes] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const percentage = sliderValue[0] / 100;
    const minutes = Math.round(
      MIN_LIFESPAN_MINUTES + percentage * (MAX_LIFESPAN_MINUTES - MIN_LIFESPAN_MINUTES)
    );
    setLifespanMinutes(minutes);
  }, [sliderValue]);

  const handleDropGeo = () => {
    if (!userLocation) {
      toast({
        title: "Location Error",
        description: "Could not get your current location. Please enable location services and try again.",
        variant: "destructive",
      });
      return;
    }
    if (activeGeo) {
       toast({
        title: "Geo Exists",
        description: "You already have an active Geo. Clear it first to drop a new one.",
        variant: "default",
      });
      return;
    }
    onDropGeo(lifespanMinutes * 60 * 1000); // Convert minutes to milliseconds
  };
  
  const handleClearGeo = () => {
    onClearGeo();
    toast({
      title: "Geo Cleared",
      description: "Your active Geo has been removed.",
    });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Drop a Geo
        </CardTitle>
        <CardDescription>
          Mark your current location with a time-limited Geo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="lifespan-slider" className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            Geo Lifespan: <span className="font-semibold">{lifespanMinutes} minutes</span>
          </Label>
          <Slider
            id="lifespan-slider"
            min={0}
            max={100}
            step={1}
            value={sliderValue}
            onValueChange={setSliderValue}
            disabled={!!activeGeo}
            aria-label="Geo lifespan slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{MIN_LIFESPAN_MINUTES} min</span>
            <span>{MAX_LIFESPAN_MINUTES} min</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleDropGeo} 
          disabled={!userLocation || !!activeGeo} 
          className="w-full sm:w-auto transition-all duration-300 ease-in-out transform hover:scale-105"
          aria-label="Drop new Geo"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Drop Geo
        </Button>
        {activeGeo && (
          <Button 
            variant="outline" 
            onClick={handleClearGeo}
            className="w-full sm:w-auto transition-all duration-300 ease-in-out"
            aria-label="Clear active Geo"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Active Geo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
