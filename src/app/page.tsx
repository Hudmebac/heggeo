
"use client";

import type { Geo } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GeoDropForm } from '@/components/GeoDropForm';
import { ActiveGeoInfo } from '@/components/ActiveGeoInfo';
import { MapDisplay } from '@/components/MapDisplay';
import { AlarmButton } from '@/components/AlarmButton';
import { JourneyTimeTracker } from '@/components/JourneyTimeTracker';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const ACTIVE_GEO_LOCAL_STORAGE_KEY = 'heggeo_active_geo';

export default function HomePage() {
  const { location: userLocation, error: locationError, loading: locationLoading, refreshLocation } = useGeoLocation();
  const [activeGeo, setActiveGeo] = useState<Geo | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // Load active Geo from local storage on mount
    const storedGeoString = localStorage.getItem(ACTIVE_GEO_LOCAL_STORAGE_KEY);
    if (storedGeoString) {
      try {
        const storedGeo = JSON.parse(storedGeoString) as Geo & { lifespan: number | null }; // Lifespan can be null if Infinity was stored
        
        if (storedGeo.lifespan === null) { // Convert null back to Infinity
          storedGeo.lifespan = Infinity;
        }

        // Check if Geo is expired (unless lifespan is Infinity)
        if (storedGeo.lifespan !== Infinity && storedGeo.timestamp + storedGeo.lifespan <= Date.now()) {
          localStorage.removeItem(ACTIVE_GEO_LOCAL_STORAGE_KEY); // Clear expired Geo
        } else {
          setActiveGeo(storedGeo as Geo);
        }
      } catch (e) {
        console.error("Error parsing stored Geo:", e);
        localStorage.removeItem(ACTIVE_GEO_LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  const handleDropGeo = useCallback((lifespan: number) => { // lifespan can be Infinity
    if (!userLocation) {
      toast({
        title: "Location Error",
        description: "Cannot drop Geo without your current location.",
        variant: "destructive",
      });
      return;
    }
    if (activeGeo) {
      toast({
        title: "Geo Limit Reached",
        description: "You already have an active Geo. Clear it first.",
        variant: "default",
      });
      return;
    }

    const newGeo: Geo = {
      id: crypto.randomUUID(),
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      timestamp: Date.now(),
      lifespan, // Can be Infinity
    };
    setActiveGeo(newGeo);
    localStorage.setItem(ACTIVE_GEO_LOCAL_STORAGE_KEY, JSON.stringify(newGeo)); // Infinity will be stringified to null
    toast({
      title: "Geo Dropped!",
      description: lifespan === Infinity 
        ? "Your Geo is now active indefinitely." 
        : `Your Geo is now active for ${Math.round(lifespan / (60 * 1000))} minutes.`,
    });
  }, [userLocation, activeGeo, toast]);

  const handleClearGeo = useCallback(() => {
    setActiveGeo(null);
    localStorage.removeItem(ACTIVE_GEO_LOCAL_STORAGE_KEY);
    toast({
      title: "Geo Cleared",
      description: "Your active Geo has been removed.",
    });
  }, [toast]);

  // Effect to auto-clear expired Geo
  useEffect(() => {
    if (!activeGeo) return;

    const checkExpiration = () => {
      // Only check expiration if lifespan is not Infinity
      if (activeGeo.lifespan !== Infinity && activeGeo.timestamp + activeGeo.lifespan <= Date.now()) {
        handleClearGeo();
        toast({
          title: "Geo Expired",
          description: "Your active Geo has expired and been cleared.",
        });
      }
    };

    // If lifespan is not Infinity, set up interval for checking
    let intervalId: NodeJS.Timeout | undefined = undefined;
    if (activeGeo.lifespan !== Infinity) {
      intervalId = setInterval(checkExpiration, 1000 * 30); // Check every 30 seconds
      checkExpiration(); // Initial check
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeGeo, handleClearGeo, toast]);


  if (!isClient || locationLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="space-y-6 md:space-y-8">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" /> {/* Skeleton for Journey Tracker */}
          </div>
          <div className="space-y-6 md:space-y-8">
            <Skeleton className="h-80 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        <div className="space-y-6 md:space-y-8 md:sticky md:top-6">
          {locationError && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md flex flex-col items-center gap-2">
              <p className="font-semibold">{locationError}</p>
              <Button onClick={refreshLocation} variant="destructive" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
          <GeoDropForm 
            userLocation={userLocation} 
            activeGeo={activeGeo} 
            onDropGeo={handleDropGeo}
            onClearGeo={handleClearGeo}
          />
          {activeGeo && (
            <ActiveGeoInfo geo={activeGeo} />
          )}
           <JourneyTimeTracker userLocation={userLocation} locationError={locationError} />
        </div>
        <div className="space-y-6 md:space-y-8">
          <MapDisplay userLocation={userLocation} activeGeo={activeGeo} locationError={locationError} />
          <AlarmButton />
        </div>
      </main>
      <Footer />
    </div>
  );
}

