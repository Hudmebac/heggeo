
"use client";

import type { Geo } from '@/lib/types';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Share2, Loader2, MapPin } from 'lucide-react';
import { getAddressFromCoordinates } from '@/app/actions/shareActions';
import { Skeleton } from '@/components/ui/skeleton';

interface ShareButtonProps {
  geo: Geo;
}

export function ShareButton({ geo }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [geoAddress, setGeoAddress] = useState<string | null>(null);

  const { toast } = useToast();

  const APP_LINK = "https://heggeo.netlify.app/";
  const HASHTAG = "#HegGeo";

  useEffect(() => {
    if (isOpen && geo) {
      setIsFetchingAddress(true);
      setGeoAddress(null); 
      getAddressFromCoordinates(geo.latitude, geo.longitude)
        .then(address => {
          setGeoAddress(address || `Coordinates: ${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)}`);
        })
        .catch(error => {
          console.error("Error fetching address:", error);
          setGeoAddress(`Error fetching address for ${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)}`);
        })
        .finally(() => {
          setIsFetchingAddress(false);
        });
    } else if (!isOpen) {
      // Reset state when dialog closes
      setCustomMessage("");
      setGeoAddress(null);
      setIsFetchingAddress(false);
    }
  }, [isOpen, geo]);

  
  const processAndShare = async () => {
    setIsProcessing(true);
    
    const geoLink = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
    const locationText = geoAddress || `Lat: ${geo.latitude.toFixed(4)}, Lon: ${geo.longitude.toFixed(4)}`;
    
    let messageParts = [
      `Hi, I am sending my current Geo Location to you as this is where I am:`,
      `${locationText}`
    ];

    if (customMessage.trim()) {
      messageParts.push(`\n${customMessage.trim()}`);
    }
    
    messageParts.push(`\nHere is a Link to the GeoDrop: ${geoLink}`);
    messageParts.push(`\n${HASHTAG}`);
    messageParts.push(`Check out HegGeo: ${APP_LINK}`);

    const fullMessage = messageParts.join('\n');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;

    window.open(whatsappUrl, '_blank');
    setIsProcessing(false);
    setIsOpen(false); 
    toast({
        title: "WhatsApp Opened",
        description: "Your message is ready. Add a photo in WhatsApp if you wish.",
    });
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const constructPreviewMessage = () => {
    const geoLink = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
    const locationText = geoAddress || (isFetchingAddress ? "Fetching address..." : `Lat: ${geo.latitude.toFixed(4)}, Lon: ${geo.longitude.toFixed(4)}`);

    let messageParts = [
      `Hi, I am sending my current Geo Location to you as this is where I am:`,
      `${locationText}`
    ];

    if (customMessage.trim()) {
      messageParts.push(`\n${customMessage.trim()}`);
    }

    messageParts.push(`\nHere is a Link to the GeoDrop: ${geoLink}`);
    messageParts.push(`\n${HASHTAG}`);
    messageParts.push(`Check out HegGeo: ${APP_LINK}`);
    return messageParts.join('\n');
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="secondary" size="default">
          <Share2 className="mr-2 h-4 w-4" />
          Share Geo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Share Geo on WhatsApp</DialogTitle>
          <DialogDescription>
            Craft your Optional message. Review Message, If you want to add photo do this in WhatsApp. Straight after sending Geo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-1">
            <Label className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> Your Location</Label>
            {isFetchingAddress ? (
              <Skeleton className="h-5 w-3/4" />
            ) : (
              <p className="text-sm text-muted-foreground break-words">{geoAddress || "Loading address..."}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="custom-message">Optional Custom Message</Label>
            <Textarea
              id="custom-message"
              placeholder="E.g., Come join me here!"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2 pt-2 border-t">
            <Label>Message Preview for WhatsApp:</Label>
            <div className="text-xs p-2 border rounded-md bg-muted/50 whitespace-pre-wrap break-words">
              {constructPreviewMessage()}
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="button" onClick={processAndShare} disabled={isProcessing || isFetchingAddress}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            Share to WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
