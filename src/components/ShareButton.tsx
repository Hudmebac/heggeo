"use client";

import type { Geo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  geo: Geo;
}

export function ShareButton({ geo }: ShareButtonProps) {
  const handleShare = () => {
    const mapLink = `https://maps.google.com/?q=${geo.latitude},${geo.longitude}`;
    let message = `Check out my Geo!\nLocation: ${mapLink}\n#HegGeo App: https://heggeo.netlify.app`;
    if (geo.photoUrl) {
      message += `\nPhoto: ${geo.photoUrl}`;
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button onClick={handleShare} variant="outline" className="w-full transition-all duration-300 ease-in-out transform hover:scale-105">
      <Share2 className="mr-2 h-4 w-4" />
      Share Geo via WhatsApp
    </Button>
  );
}
