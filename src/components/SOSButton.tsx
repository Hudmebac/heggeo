
"use client";

import { useState, useCallback } from 'react';
import type { SOSSetting, UserLocation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { getAddressFromCoordinates } from '@/app/actions/shareActions';

interface SOSButtonProps {
  onNeedsSetup: () => void; // Callback to open the setup modal
}

const SOS_CONFIG_LOCAL_STORAGE_KEY = 'heggeo_sos_configurations_array'; // Updated key
const APP_LINK = "https://heggeo.netlify.app/";
const HASHTAG = "#HegGeo";

export function SOSButton({ onNeedsSetup }: SOSButtonProps) {
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const { toast } = useToast();
  const { location: userLocation, error: locationError, loading: locationLoading, refreshLocation } = useGeoLocation();

  const handleSOS = async () => {
    const storedConfigsString = localStorage.getItem(SOS_CONFIG_LOCAL_STORAGE_KEY);
    let sosConfigs: SOSSetting[] = [];
    if (storedConfigsString) {
      try {
        sosConfigs = JSON.parse(storedConfigsString) as SOSSetting[];
      } catch (e) {
        console.error("Error parsing SOS configurations:", e);
        toast({
          title: "SOS Config Error",
          description: "Could not load SOS settings. Please re-configure.",
          variant: "destructive",
          action: <Button onClick={onNeedsSetup} variant="secondary" size="sm">Setup SOS</Button>
        });
        return;
      }
    }

    const defaultSosConfig = sosConfigs.find(config => config.isDefault);

    if (!defaultSosConfig) {
      toast({
        title: "Default SOS Not Set",
        description: sosConfigs.length > 0 ? "Please set a default SOS configuration." : "Please set up your SOS contact and message first.",
        variant: "destructive",
        action: <Button onClick={onNeedsSetup} variant="secondary" size="sm">Setup SOS</Button>
      });
      return;
    }

    let currentSosLocation = userLocation;
    if (!currentSosLocation && !locationLoading) {
        await refreshLocation(); // Attempt to refresh
        // This updates userLocation state in the hook, which might not be immediately available here.
        // We'll re-check it below.
    }

    if (locationLoading) {
        toast({ title: "Getting Location...", description: "Please wait while we fetch your current position." });
        return;
    }
    
    // Re-check location after potential refresh attempt or if it was loading
    currentSosLocation = userLocation; // Use the hook's current state for userLocation
    if (!currentSosLocation) {
        toast({
          title: "Location Unavailable",
          description: locationError || "Could not get your current location for SOS. Please enable location services.",
          variant: "destructive",
        });
        return;
    }


    setIsSendingSOS(true);

    try {
      const sosConfigToUse = defaultSosConfig; // Already found the default
      
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
        `${sosConfigToUse.contactDisplayName},`,
        `It Is ${sosConfigToUse.userName},`,
        `I am in ${sosConfigToUse.defaultSituation}`,
        `Find me here: ${locationText} (${locationUrl})`,
        `${HASHTAG} Link: ${APP_LINK}`
      ];
      const fullMessage = messageParts.join('\n');
      const whatsappUrl = `https://wa.me/${sosConfigToUse.targetPhoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(fullMessage)}`;

      window.open(whatsappUrl, '_blank');
      toast({
        title: "SOS Message Prepared",
        description: `Using "${sosConfigToUse.name}". WhatsApp is opening. Send it now!`,
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
