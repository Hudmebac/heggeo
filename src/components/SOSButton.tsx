
"use client";

import { useState, useCallback } from 'react';
import type { SOSSettings, UserLocation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { getAddressFromCoordinates } from '@/app/actions/shareActions';

interface SOSButtonProps {
  onNeedsSetup: () => void; // Callback to open the setup modal
}

const SOS_CONFIG_LOCAL_STORAGE_KEY = 'heggeo_sos_configuration';
const APP_LINK = "https://heggeo.netlify.app/";
const HASHTAG = "#HegGeo";

export function SOSButton({ onNeedsSetup }: SOSButtonProps) {
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const { toast } = useToast();
  const { location: userLocation, error: locationError, loading: locationLoading, refreshLocation } = useGeoLocation();

  const handleSOS = async () => {
    const storedConfigString = localStorage.getItem(SOS_CONFIG_LOCAL_STORAGE_KEY);
    if (!storedConfigString) {
      toast({
        title: "SOS Not Configured",
        description: "Please set up your SOS contact and message first.",
        variant: "destructive",
        action: <Button onClick={onNeedsSetup} variant="secondary" size="sm">Setup SOS</Button>
      });
      // onNeedsSetup(); // Optionally open modal directly
      return;
    }

    let currentSosLocation = userLocation;
    if (!currentSosLocation && !locationLoading) {
        // If no location and not loading, try to refresh
        await refreshLocation(); // This will update userLocation via the hook's state
        // We need to wait for the location to be available. This could be complex.
        // For now, let's assume refreshLocation updates `userLocation` observed by the next render or a short delay.
        // A more robust solution might involve awaiting a promise from refreshLocation.
        // However, useGeoLocation doesn't return a promise from refreshLocation.
        // Let's proceed, and if location is still null, we'll show an error.
    }


    if (locationLoading) {
        toast({ title: "Getting Location...", description: "Please wait while we fetch your current position." });
        return;
    }
    
    // Re-check location after potential refresh attempt or if it was loading
    if (!userLocation) { // Check hook's current userLocation state
        toast({
          title: "Location Unavailable",
          description: locationError || "Could not get your current location for SOS. Please enable location services.",
          variant: "destructive",
        });
        return;
    }
    currentSosLocation = userLocation; // Use the (potentially) updated location


    setIsSendingSOS(true);

    try {
      const sosConfig = JSON.parse(storedConfigString) as SOSSettings;
      
      let locationText = `Coordinates: ${currentSosLocation.latitude.toFixed(5)}, ${currentSosLocation.longitude.toFixed(5)}`;
      try {
        const address = await getAddressFromCoordinates(currentSosLocation.latitude, currentSosLocation.longitude);
        if (address && !address.toLowerCase().includes("error") && !address.toLowerCase().includes("invalid")) {
            locationText = address;
        }
      } catch (addrError) {
        console.warn("SOS: Could not fetch address, using coordinates.", addrError);
      }

      const locationUrl = `https://www.google.com/maps?q=${currentSosLocation.latitude},${currentSosLocation.longitude}`;

      const messageParts = [
        `${sosConfig.contactDisplayName},`,
        `It Is ${sosConfig.userName},`,
        `I am in ${sosConfig.defaultSituation}`,
        `Find me here: ${locationText} (${locationUrl})`,
        `${HASHTAG} Link: ${APP_LINK}`
      ];
      const fullMessage = messageParts.join('\n');
      const whatsappUrl = `https://wa.me/${sosConfig.targetPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(fullMessage)}`;

      window.open(whatsappUrl, '_blank');
      toast({
        title: "SOS Message Prepared",
        description: "WhatsApp is opening with your SOS message. Send it now!",
      });

    } catch (e) {
      console.error("Error processing SOS:", e);
      toast({
        title: "SOS Error",
        description: "Could not prepare SOS message. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSendingSOS(false);
    }
  };

  return (
    <Button
      onClick={handleSOS}
      disabled={isSendingSOS || locationLoading}
      variant="destructive"
      size="default"
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-all duration-150 ease-in-out transform active:scale-95"
      aria-label="Send SOS message"
    >
      {isSendingSOS || locationLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <LifeBuoy className="h-5 w-5" />
      )}
      SOS
    </Button>
  );
}
