
"use client";

import type { Geo, SharePlatform } from '@/lib/types';
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
import { Share2, Loader2, MapPin, Twitter, Linkedin, ClipboardCopy, Pin } from 'lucide-react';
import { getAddressFromCoordinates } from '@/app/actions/shareActions';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShareButtonProps {
  geo: Geo;
}

interface PlatformOption {
  value: SharePlatform;
  label: string;
  icon?: React.ReactNode;
}

export function ShareButton({ geo }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [geoAddress, setGeoAddress] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform>('whatsapp');

  const { toast } = useToast();

  const APP_LINK = "https://heggeo.netlify.app/";
  const HASHTAG = "#HegGeo";

  const platformOptions: PlatformOption[] = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'twitter', label: 'Twitter / X', icon: <Twitter className="h-4 w-4" /> },
    { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" /> },
    { value: 'pinterest', label: 'Pinterest', icon: <Pin className="h-4 w-4" /> },
    { value: 'copy', label: 'Copy to Clipboard', icon: <ClipboardCopy className="h-4 w-4" /> },
  ];

  useEffect(() => {
    if (isOpen && geo) {
      setIsFetchingAddress(true);
      setGeoAddress(null); // Reset before fetching
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
      setSelectedPlatform('whatsapp'); // Reset to default
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
    
    const baseMessage = messageParts.join('\n');
    let shareUrl = "";
    let platformName = platformOptions.find(p => p.value === selectedPlatform)?.label || 'Selected Platform';

    switch (selectedPlatform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(baseMessage)}`;
        window.open(shareUrl, '_blank');
        break;
      case 'twitter':
        const twitterMessage = [
            `Hi, I'm at: ${locationText}`,
            customMessage.trim() ? `\n${customMessage.trim()}` : '',
            `\nLocation: ${geoLink}`,
            `\n${HASHTAG} #GeoDrop`,
            `\nvia ${APP_LINK}`
        ].filter(Boolean).join('\n');
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage.substring(0, 270))}`; 
        window.open(shareUrl, '_blank');
        break;
      case 'linkedin':
        const linkedInTitle = `My Current Location via HegGeo`;
        const linkedInSummary = baseMessage;
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(APP_LINK)}&title=${encodeURIComponent(linkedInTitle)}&summary=${encodeURIComponent(linkedInSummary)}&source=${encodeURIComponent("HegGeo App")}`;
        window.open(shareUrl, '_blank');
        break;
      case 'pinterest':
        const pinterestDescription = [
          `My current location via HegGeo: ${locationText}.`,
          customMessage.trim() ? customMessage.trim() : '',
          HASHTAG
        ].filter(Boolean).join(' ');
        const placeholderImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${geo.latitude},${geo.longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7Clabel:G%7C${geo.latitude},${geo.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`; // Replace with actual key if available or remove 
        shareUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(geoLink)}&description=${encodeURIComponent(pinterestDescription)}&media=${encodeURIComponent(placeholderImageUrl)}`; 
        window.open(shareUrl, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(baseMessage)
          .then(() => {
            toast({ title: "Copied to Clipboard!", description: "Message copied. You can paste it into any app." });
          })
          .catch(err => {
            toast({ title: "Copy Failed", description: "Could not copy message to clipboard.", variant: "destructive" });
            console.error("Failed to copy: ", err);
          });
        setIsProcessing(false);
        setIsOpen(false);
        return; 
    }

    if (selectedPlatform !== 'copy') {
      toast({
        title: `${platformName} Opened`,
        description: "Your message is ready. Add media in the app if you wish, then send it!",
      });
    }
    setIsProcessing(false);
    setIsOpen(false);
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
          <DialogTitle>Share Geo</DialogTitle>
          <DialogDescription>
            Craft your Optional message. Review Message, If you want to add photo do this in the chosen app. Straight after sending Geo.
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

          <div className="grid gap-2">
            <Label htmlFor="share-platform">Share to</Label>
            <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as SharePlatform)}>
              <SelectTrigger id="share-platform" className="w-full">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 pt-2 border-t">
            <Label>Message Preview:</Label>
            <div className="text-xs p-2 border rounded-md bg-muted/50 whitespace-pre-wrap break-words">
              {constructPreviewMessage()}
            </div>
             <p className="text-xs text-muted-foreground">Actual message format may vary slightly by platform.</p>
          </div>

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="button" onClick={processAndShare} disabled={isProcessing || isFetchingAddress}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            Share to {platformOptions.find(p => p.value === selectedPlatform)?.label || 'Selected Platform'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

