"use client";

import type { Geo } from '@/lib/types';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Re-using ShadCN Input for file
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Share2, ImageUp, Camera, Loader2, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { describeImage } from '@/ai/flows/describe-image-flow'; // Import the Genkit flow
import { Label } from '@/components/ui/label';

interface ShareButtonProps {
  geo: Geo;
}

export function ShareButton({ geo }: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetImageState = useCallback(() => {
    setImageDataUri(null);
    setAiDescription(null);
    setIsGeneratingDescription(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setHasCameraPermission(null); 
    // setShowCamera(false); // Don't hide camera view if reset is called from within camera view (e.g. permission denial)
  }, []);

  
  useEffect(() => {
    if (showCamera) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
          setShowCamera(false); // Hide camera view if permission denied
          resetImageState();
        }
      };
      getCameraPermission();
    } else {
       // Cleanup camera stream when showCamera becomes false
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
    // Ensure cleanup when component unmounts or showCamera changes
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, toast, resetImageState]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Image Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUri(reader.result as string);
        setAiDescription(null); // Clear previous AI description
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && hasCameraPermission) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Use image/jpeg for smaller file sizes, adjust quality as needed
        const dataUri = canvas.toDataURL('image/jpeg', 0.8); 
        setImageDataUri(dataUri);
        setAiDescription(null); // Clear previous AI description
      }
      setShowCamera(false); // Hide camera view after capture
    } else {
        toast({
            title: "Capture Failed",
            description: "Could not capture photo. Ensure camera is active and permissions are granted.",
            variant: "destructive",
        });
    }
  };

  const handleGenerateDescription = async () => {
    if (!imageDataUri) return;
    setIsGeneratingDescription(true);
    try {
      const result = await describeImage({ photoDataUri: imageDataUri });
      setAiDescription(result.description);
      toast({
        title: "AI Description Generated!",
        description: "You can edit the description below if needed.",
      });
    } catch (error) {
      console.error("Error generating AI description:", error);
      toast({
        title: "AI Description Failed",
        description: (error as Error).message || "Could not generate a description. Please try again or write your own.",
        variant: "destructive",
      });
      setAiDescription(""); // Allow manual input even if AI fails
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleFinalShare = () => {
    const mapLink = `https://maps.google.com/?q=${geo.latitude},${geo.longitude}`;
    
    let messageParts = [];
    if (customMessage.trim()) {
      messageParts.push(customMessage.trim());
    }
    messageParts.push(`Check out my Geo!\nLocation: ${mapLink}`);

    if (imageDataUri) {
      let imageMessage = "\nI'm sharing a photo with this Geo";
      if (aiDescription && aiDescription.trim()) {
        imageMessage += `: "${aiDescription.trim()}"`;
      } else {
        imageMessage += ".";
      }
      imageMessage += "\n(I'll send the image in WhatsApp shortly!)";
      messageParts.push(imageMessage);
    }
    
    messageParts.push(`\n#HegGeo\nApp: https://heggeo.netlify.app`);

    const finalMessage = messageParts.join('\n\n');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(finalMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    setDialogOpen(false); // Close dialog after attempting to share
  };

  const handleDialogClose = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      setCustomMessage("");
      resetImageState();
      setShowCamera(false); 
    }
  }

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} variant="outline" className="w-full transition-all duration-300 ease-in-out transform hover:scale-105">
        <Share2 className="mr-2 h-4 w-4" />
        Share Geo via WhatsApp
      </Button>

      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Geo on WhatsApp</DialogTitle>
            <DialogDescription>
              Add a message and optionally a photo to share with your Geo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Add an optional message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!imageDataUri && !showCamera && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <ImageUp className="mr-2 h-4 w-4" /> Upload Photo
                </Button>
                <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button variant="outline" onClick={() => setShowCamera(true)}>
                  <Camera className="mr-2 h-4 w-4" /> Use Camera
                </Button>
              </div>
            )}

            {showCamera && (
              <div className="space-y-2">
                <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video rounded-md bg-muted border" />
                {hasCameraPermission === false && (
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                        Please enable camera permissions in your browser settings to use this feature.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex gap-2">
                    <Button onClick={handleCapture} disabled={hasCameraPermission !== true} className="flex-1">Capture Photo</Button>
                    <Button variant="outline" onClick={() => {setShowCamera(false); resetImageState();}} className="flex-1">Cancel</Button>
                </div>
              </div>
            )}

            {imageDataUri && !showCamera && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium">Photo Preview:</p>
                <div className="flex justify-center">
                    <img src={imageDataUri} alt="Selected preview" className="rounded-md max-h-40 w-auto border" />
                </div>
                
                <Button variant="outline" size="sm" onClick={() => { resetImageState(); if (fileInputRef.current) fileInputRef.current.value = "";}} className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove Photo
                </Button>

                {aiDescription === null ? ( // Show generate button only if not yet generated or explicitly cleared
                    <Button onClick={handleGenerateDescription} disabled={isGeneratingDescription} className="w-full">
                    {isGeneratingDescription && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate AI Description
                    </Button>
                ) : (
                    <div className="space-y-1">
                        <Label htmlFor="aiDescText">AI Description (editable):</Label>
                        <Textarea 
                            id="aiDescText"
                            placeholder="AI description will appear here, or write your own."
                            value={aiDescription}
                            onChange={(e) => setAiDescription(e.target.value)}
                            rows={3} 
                        />
                    </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleFinalShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share on WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}