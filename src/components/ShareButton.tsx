
"use client";

import type { Geo } from '@/lib/types';
import { useState, useRef, useCallback, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Share2, Camera, Paperclip, Loader2, MapPin } from 'lucide-react';
import { describeImage, type DescribeImageInput } from '@/ai/flows/describe-image-flow';
import NextImage from 'next/image';
import { getAddressFromCoordinates } from '@/app/actions/shareActions';
import { Skeleton } from '@/components/ui/skeleton';

interface ShareButtonProps {
  geo: Geo;
}

export function ShareButton({ geo }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [geoAddress, setGeoAddress] = useState<string | null>(null);
  const [generatedImageDescription, setGeneratedImageDescription] = useState<string>("");


  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const { toast } = useToast();

  const APP_LINK = "https://heggeo.netlify.app/";
  const HASHTAG = "#HegGeo";

  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, [stream]);

  useEffect(() => {
    if (isOpen && geo) {
      setIsFetchingAddress(true);
      setGeoAddress(null); // Reset address on dialog open
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
      stopCameraStream();
      setCustomMessage("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setHasCameraPermission(null);
      setGeoAddress(null);
      setIsFetchingAddress(false);
      setGeneratedImageDescription("");
    }
  }, [isOpen, geo, stopCameraStream]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setGeneratedImageDescription(""); // Reset AI description if new photo uploaded
      if (isCameraOpen && stream) { 
        stopCameraStream();
      }
    }
  };

  const handleOpenCamera = async () => {
    if (isCameraOpen && stream) {
      stopCameraStream();
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOpen(true);
      setHasCameraPermission(true);
      setPhotoFile(null); 
      setPhotoPreview(null);
      setGeneratedImageDescription(""); // Reset AI description
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], "capture.png", { type: "image/png" });
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
            setGeneratedImageDescription(""); // Reset AI description
          }
        }, 'image/png');
      }
      stopCameraStream();
    }
  };
  
  const processAndShare = async () => {
    setIsProcessing(true);
    let currentImageDescription = "";

    if (photoFile && !generatedImageDescription) { // Only generate if not already generated for current photo
      try {
        const photoDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });

        const aiInput: DescribeImageInput = { photoDataUri };
        const aiOutput = await describeImage(aiInput);
        currentImageDescription = aiOutput.description;
        setGeneratedImageDescription(currentImageDescription); // Store for preview
        toast({ title: "AI Description Generated", description: `"${currentImageDescription}"` });
      } catch (error) {
        console.error("Error processing image for AI description:", error);
        toast({
          title: "AI Error",
          description: "Could not generate image description. Sharing without it.",
          variant: "default",
        });
      }
    } else if (photoFile && generatedImageDescription) {
      currentImageDescription = generatedImageDescription; // Use already generated one
    }


    const geoLink = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
    const locationText = geoAddress || `Lat: ${geo.latitude.toFixed(4)}, Lon: ${geo.longitude.toFixed(4)}`;
    
    let messageParts = [
      "Hi, I am sending my current Geo Location to you as this is where I am.",
      `I am at: ${locationText}`,
      `Here is a Link to the GeoDrop: ${geoLink}`
    ];

    if (customMessage.trim()) {
      messageParts.push(`\nMy message: ${customMessage.trim()}`);
    }

    if (photoFile) {
      // Note to user about manual attachment is good, but not explicitly requested for UI.
      // For now, the preview in-app serves as the "Present Image" part.
      // The AI description will be part of the text.
      if (currentImageDescription) {
        messageParts.push(`\nAbout the image: ${currentImageDescription}`);
      } else {
        messageParts.push("\n(See attached image)");
      }
    }

    messageParts.push(`\n${HASHTAG}`);
    messageParts.push(`Check out HegGeo: ${APP_LINK}`);

    const fullMessage = messageParts.join('\n');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;

    window.open(whatsappUrl, '_blank');
    setIsProcessing(false);
    setIsOpen(false); // Close dialog after sharing
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const constructPreviewMessage = () => {
    const geoLink = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
    const locationText = geoAddress || (isFetchingAddress ? "Fetching address..." : `Lat: ${geo.latitude.toFixed(4)}, Lon: ${geo.longitude.toFixed(4)}`);

    let messageParts = [
      "Hi, I am sending my current Geo Location to you as this is where I am.",
      `I am at: ${locationText}`,
      `Here is a Link to the GeoDrop: ${geoLink}`
    ];

    if (customMessage.trim()) {
      messageParts.push(`\nMy message: ${customMessage.trim()}`);
    }
    
    if (photoFile) {
      if (generatedImageDescription) {
        messageParts.push(`\nAbout the image: ${generatedImageDescription}`);
      } else if (isProcessing && !generatedImageDescription) {
        messageParts.push(`\nAbout the image: (Generating description...)`);
      } else {
         messageParts.push(`\n(Image will be attached - AI description pending or not generated)`);
      }
    }

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
            Craft your message. Photo (if added) and AI description will be part of the text. You'll need to manually attach the photo in WhatsApp.
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
            <Label>Optional Photo</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleOpenCamera} className="flex-1">
                <Camera className="mr-2 h-4 w-4" /> {isCameraOpen ? "Close Camera" : "Open Camera"}
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                <Paperclip className="mr-2 h-4 w-4" /> Upload Photo
              </Button>
              <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          {isCameraOpen && (
            <div className="space-y-2">
              <div className="relative w-full aspect-video rounded-md bg-muted overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              </div>
              <Button onClick={handleCapturePhoto} className="w-full" disabled={!stream || !isCameraOpen}>
                <Camera className="mr-2 h-4 w-4" /> Capture Photo
              </Button>
            </div>
          )}
           {hasCameraPermission === false && !isCameraOpen && (
             <p className="text-sm text-destructive">Camera permission was denied. Please enable it in browser settings.</p>
           )}
          <canvas ref={canvasRef} className="hidden"></canvas>

          {photoPreview && (
            <div className="mt-2 space-y-1">
              <Label>Photo Preview:</Label>
              <div className="relative w-full h-auto max-h-[200px] rounded-md overflow-hidden border" data-ai-hint="photo preview placeholder">
                <NextImage 
                  src={photoPreview} 
                  alt="Photo preview" 
                  layout="responsive"
                  width={400} 
                  height={300} 
                  objectFit="contain"
                />
              </div>
            </div>
          )}
          
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
