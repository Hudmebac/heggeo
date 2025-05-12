
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { SOSSettings } from '@/lib/types';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Info } from 'lucide-react';

interface SOSSetupModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const SOS_CONFIG_LOCAL_STORAGE_KEY = 'heggeo_sos_configuration';

export function SOSSetupModal({ isOpen, onOpenChange }: SOSSetupModalProps) {
  const [targetPhoneNumber, setTargetPhoneNumber] = useState('');
  const [contactDisplayName, setContactDisplayName] = useState('');
  const [userName, setUserName] = useState('');
  const [defaultSituation, setDefaultSituation] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const storedConfigString = localStorage.getItem(SOS_CONFIG_LOCAL_STORAGE_KEY);
      if (storedConfigString) {
        try {
          const storedConfig = JSON.parse(storedConfigString) as SOSSettings;
          setTargetPhoneNumber(storedConfig.targetPhoneNumber || '');
          setContactDisplayName(storedConfig.contactDisplayName || '');
          setUserName(storedConfig.userName || '');
          setDefaultSituation(storedConfig.defaultSituation || '');
        } catch (e) {
          console.error("Error parsing stored SOS config:", e);
          toast({ title: "Error loading SOS settings", variant: "destructive" });
        }
      }
    }
  }, [isOpen, toast]);

  const handleSave = useCallback(() => {
    if (!targetPhoneNumber || !contactDisplayName || !userName || !defaultSituation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields for SOS setup.",
        variant: "destructive",
      });
      return;
    }

    // Basic phone number validation (starts with +, then digits)
    if (!/^\+\d+$/.test(targetPhoneNumber)) {
        toast({
            title: "Invalid Phone Number",
            description: "Phone number must start with '+' followed by digits (e.g., +11234567890).",
            variant: "destructive",
        });
        return;
    }


    const newConfig: SOSSettings = {
      targetPhoneNumber,
      contactDisplayName,
      userName,
      defaultSituation,
    };
    localStorage.setItem(SOS_CONFIG_LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
    toast({
      title: "SOS Settings Saved",
      description: "Your SOS contact and message template have been saved.",
    });
    onOpenChange(false);
  }, [targetPhoneNumber, contactDisplayName, userName, defaultSituation, toast, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl">Configure SOS Message</DialogTitle>
          <DialogDescription>
            Set up your emergency contact and default SOS message. This will be stored locally on your device.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-1">
            <Label htmlFor="sos-phone">Emergency WhatsApp Number</Label>
            <Input
              id="sos-phone"
              value={targetPhoneNumber}
              onChange={(e) => setTargetPhoneNumber(e.target.value)}
              placeholder="e.g., +11234567890 (with country code)"
            />
            <p className="text-xs text-muted-foreground">The WhatsApp number to send the SOS message to.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sos-contact-name">Contact's Display Name</Label>
            <Input
              id="sos-contact-name"
              value={contactDisplayName}
              onChange={(e) => setContactDisplayName(e.target.value)}
              placeholder="e.g., Emergency Services, Mom, John Doe"
            />
            <p className="text-xs text-muted-foreground">How the contact will be addressed in the message (e.g., "Mom,").</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sos-user-name">Your Name</Label>
            <Input
              id="sos-user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g., Craig Heggie"
            />
             <p className="text-xs text-muted-foreground">Your name as it will appear in the message.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sos-situation">Default Situation / Initial Message</Label>
            <Textarea
              id="sos-situation"
              value={defaultSituation}
              onChange={(e) => setDefaultSituation(e.target.value)}
              placeholder="e.g., I am in distress and need help urgently."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">The main reason for your SOS (e.g., "in Distress", "Lost", "Medical Emergency").</p>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-md border">
            <h4 className="font-semibold text-sm mb-2 flex items-center"><Info className="h-4 w-4 mr-1 text-primary" /> SOS Message Structure:</h4>
            <p className="text-xs whitespace-pre-wrap break-words">
              {`[Contact's Display Name],
It Is [Your Name],
I am in [Default Situation]
Find me here: [Current Location Address] ([Map Link])
#HegGeo Link: https://heggeo.netlify.app/`}
            </p>
            <p className="text-xs mt-2 text-muted-foreground">
              The location and map link will be automatically added when you send an SOS.
            </p>
          </div>

          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300">Effective SOS Message Tips:</h4>
            <ul className="list-disc list-inside text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li><strong>WHO:</strong> Your name is included. If in a group, mention numbers.</li>
                <li><strong>WHERE:</strong> Precise location is auto-added.</li>
                <li><strong>WHAT:</strong> Clearly state the nature of emergency in "Default Situation".</li>
                <li><strong>CONDITION:</strong> Briefly mention status (e.g., "injured but stable").</li>
                <li><strong>NEEDS:</strong> What specific help (e.g., "medical evac", "rescue").</li>
            </ul>
            <p className="text-xs mt-1 text-blue-500 dark:text-blue-500">Add these details to your 'Default Situation' message for clarity.</p>
          </div>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save SOS Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
