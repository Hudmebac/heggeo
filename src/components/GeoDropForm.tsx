
"use client";

import type { Geo, UserLocation } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Trash2 } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';

interface GeoDropFormProps {
  userLocation: UserLocation | null;
  activeGeo: Geo | null;
  onDropGeo: (lifespan: number) => void;
  onClearGeo: () => void;
}

const MIN_LIFESPAN_MINUTES = 5;
const MAX_LIFESPAN_MINUTES = 120; // 2 hours
const DEFAULT_SLIDER_PERCENTAGE_FOR_60_MIN = 48; // (60-5) / (120-5) * 100 = 47.82 -> 48%

export function GeoDropForm({ userLocation, activeGeo, onDropGeo, onClearGeo }: GeoDropFormProps) {
  const [sliderValue, setSliderValue] = useState([DEFAULT_SLIDER_PERCENTAGE_FOR_60_MIN]);
  const [noExpiry, setNoExpiry] = useState(false);
  const [displayedLifespan, setDisplayedLifespan] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (noExpiry) {
      setDisplayedLifespan("No Expiry");
    } else {
      const percentage = sliderValue[0] / 100;
      const minutes = Math.round(
        MIN_LIFESPAN_MINUTES + percentage * (MAX_LIFESPAN_MINUTES - MIN_LIFESPAN_MINUTES)
      );
      setDisplayedLifespan(`${minutes} minutes`);
    }
  }, [sliderValue, noExpiry]);

  const handleDropGeoClick = () => {
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

    let actualLifespanMs: number;
    if (noExpiry) {
      actualLifespanMs = Infinity;
    } else {
      const percentage = sliderValue[0] / 100;
      const minutes = Math.round(
        MIN_LIFESPAN_MINUTES + percentage * (MAX_LIFESPAN_MINUTES - MIN_LIFESPAN_MINUTES)
      );
      actualLifespanMs = minutes * 60 * 1000;
    }
    onDropGeo(actualLifespanMs);
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
          Mark your current location with a time-limited Geo. Default is 60 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="lifespan-slider" className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-secondary" />
            Geo Lifespan: <span className="font-semibold">{displayedLifespan}</span>
          </Label>
          <Slider
            id="lifespan-slider"
            min={0}
            max={100}
            step={1}
            value={sliderValue}
            onValueChange={setSliderValue}
            disabled={!!activeGeo || noExpiry}
            aria-label="Geo lifespan slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{MIN_LIFESPAN_MINUTES} min</span>
            <span>{MAX_LIFESPAN_MINUTES} min</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="no-expiry"
            checked={noExpiry}
            onCheckedChange={(checked) => setNoExpiry(Boolean(checked))}
            disabled={!!activeGeo}
            aria-label="Set Geo to not expire"
          />
          <Label htmlFor="no-expiry" className="text-sm font-normal">
            No Lifespan (Geo won't expire automatically)
          </Label>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleDropGeoClick} 
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

