
"use client";

import type { Geo } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, MapPin, CalendarClock } from 'lucide-react';
import { ShareButton } from './ShareButton';

interface ActiveGeoInfoProps {
  geo: Geo;
}

function formatTime(ms: number): string {
  if (ms === Infinity) return "No Expiry";
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export function ActiveGeoInfo({ geo }: ActiveGeoInfoProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (geo.lifespan === Infinity) {
      setTimeLeft(Infinity);
      return () => {}; // No interval needed for indefinite Geo
    }

    const calculateTimeLeft = () => {
      const endTime = geo.timestamp + geo.lifespan;
      const diff = endTime - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    };

    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(intervalId);
  }, [geo]);

  if (!geo) return null;

  const creationDate = new Date(geo.timestamp).toLocaleTimeString();

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary animate-pulse" />
          Active Geo
        </CardTitle>
        <CardDescription>
          Your currently active Geo details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="flex items-center gap-1 py-1 px-2">
            <Timer className="h-4 w-4" />
            Time Remaining
          </Badge>
          <span className="font-semibold text-lg text-primary">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Location:
          </span>
          <span>{geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            Dropped at:
          </span>
          <span>{creationDate}</span>
        </div>
         <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Timer className="h-4 w-4" /> {/* Replaced Clock with Timer */}
            Total Lifespan:
          </span>
          <span>
            {geo.lifespan === Infinity ? "Indefinite" : `${Math.round(geo.lifespan / (60 * 1000))} minutes`}
          </span>
        </div>
        <ShareButton geo={geo} />
      </CardContent>
    </Card>
  );
}

