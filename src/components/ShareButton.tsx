
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
import { Share2, Camera, Paperclip, Loader2 } from 'lucide-react';
import { describeImage, type DescribeImageInput } from '@/ai/flows/describe-image-flow';
import NextImage from 'next/image'; // Renamed to avoid conflict if any, and use for Next.js image optimization

interface ShareButtonProps {
  geo: Geo;
}

export function ShareButton({ geo }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);


  const { toast } = useToast();

  const APP_LINK = "https://heggeo.netlify.app/";
  const HASHTAG = "#HegGeo";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      if (isCameraOpen && stream) { // Close camera if open
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsCameraOpen(false);
        if (videoRef.current) videoRef.current.srcObject = null;
      }
    }
  };

  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, [stream]);

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
          }
        }, 'image/png');
      }
      stopCameraStream();
    }
  };

  const handleShare = async () => {
    setIsProcessing(true);
    let imageDescription = "";
    
    if (photoFile) {
      try {
        const photoDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photoFile);
        });

        const aiInput: DescribeImageInput = { photoDataUri };
        const aiOutput = await describeImage(aiInput);
        imageDescription = aiOutput.description;
        toast({ title: "AI Description", description: `Generated: ${imageDescription}` });
      } catch (error) {
        console.error("Error processing image for AI description:", error);
        toast({
          title: "AI Error",
          description: "Could not generate image description. Sharing without it.",
          variant: "default",
        });
      }
    }

    const geoLink = `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`;
    
    let messageParts = [];
    if (customMessage) messageParts.push(customMessage);
    messageParts.push(`My current GeoDrop: ${geoLink}`);
    if (imageDescription) messageParts.push(`\nImage: ${imageDescription}`);
    messageParts.push(`\n${HASHTAG}`);
    messageParts.push(`Check out HegGeo: ${APP_LINK}`);

    const fullMessage = messageParts.join('\n');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;

    window.open(whatsappUrl, '_blank');
    setIsProcessing(false);
    setIsOpen(false); // Close dialog after sharing
    // Reset state after closing
    setCustomMessage("");
    setPhotoFile(null);
    setPhotoPreview(null);
    stopCameraStream();
  };
  
  useEffect(() => {
    // Cleanup stream if component unmounts or dialog is closed
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) { 
      stopCameraStream();
      // Reset states when dialog closes to ensure fresh state on reopen
      setCustomMessage("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setHasCameraPermission(null); // Reset camera permission status
    }
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
            Add an optional message and photo to share with your Geo location.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="custom-message">Optional Message</Label>
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

        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleShare} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    