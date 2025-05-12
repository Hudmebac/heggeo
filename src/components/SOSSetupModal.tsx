
"use client";

import * as React from 'react'; // Added import
import { useState, useEffect, useCallback } from 'react';
import type { SOSSetting } from '@/lib/types';
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
import { Save, Info, PlusCircle, Edit, Trash2, Star, ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SOSSetupModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const SOS_CONFIG_LOCAL_STORAGE_KEY = 'heggeo_sos_configurations_array'; // Updated key

const initialNewConfigState: Omit<SOSSetting, 'id' | 'isDefault'> = {
  name: '',
  targetPhoneNumber: '',
  contactDisplayName: '',
  userName: '',
  defaultSituation: '',
};

export function SOSSetupModal({ isOpen, onOpenChange }: SOSSetupModalProps) {
  const [allSosConfigs, setAllSosConfigs] = useState<SOSSetting[]>([]);
  const [currentConfig, setCurrentConfig] = useState<Partial<SOSSetting> & { id?: string }>(initialNewConfigState);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const { toast } = useToast();

  const loadConfigs = useCallback(() => {
    const storedConfigsString = localStorage.getItem(SOS_CONFIG_LOCAL_STORAGE_KEY);
    if (storedConfigsString) {
      try {
        const parsedConfigs = JSON.parse(storedConfigsString) as SOSSetting[];
        setAllSosConfigs(parsedConfigs);
        return parsedConfigs;
      } catch (e) {
        console.error("Error parsing stored SOS configs:", e);
        toast({ title: "Error loading SOS settings", variant: "destructive" });
      }
    }
    return [];
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      const configs = loadConfigs();
      if (configs.length === 0) {
        setMode('add'); // If no configs, go directly to add mode
        setCurrentConfig({ ...initialNewConfigState });
      } else {
        setMode('list');
      }
    } else {
      // Reset form when modal is closed
      setCurrentConfig({ ...initialNewConfigState });
      setMode('list'); 
    }
  }, [isOpen, loadConfigs]);

  const saveConfigsToStorage = (configs: SOSSetting[]) => {
    localStorage.setItem(SOS_CONFIG_LOCAL_STORAGE_KEY, JSON.stringify(configs));
    setAllSosConfigs(configs); // Update state
  };

  const handleSave = useCallback(() => {
    if (!currentConfig.name || !currentConfig.targetPhoneNumber || !currentConfig.contactDisplayName || !currentConfig.userName || !currentConfig.defaultSituation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields for this SOS configuration.",
        variant: "destructive",
      });
      return;
    }
    if (!/^\+\d+$/.test(currentConfig.targetPhoneNumber)) {
        toast({
            title: "Invalid Phone Number",
            description: "Phone number must start with '+' followed by digits (e.g., +11234567890).",
            variant: "destructive",
        });
        return;
    }

    let updatedConfigs = [...allSosConfigs];
    const isDefaultAlreadySet = updatedConfigs.some(c => c.isDefault && c.id !== currentConfig.id);

    if (mode === 'add') {
      const newConfig: SOSSetting = {
        id: crypto.randomUUID(),
        name: currentConfig.name!,
        targetPhoneNumber: currentConfig.targetPhoneNumber!,
        contactDisplayName: currentConfig.contactDisplayName!,
        userName: currentConfig.userName!,
        defaultSituation: currentConfig.defaultSituation!,
        isDefault: !isDefaultAlreadySet || currentConfig.isDefault || false, // Make default if it's the first one, or if explicitly set
      };
      // If this new config is set as default, unset others
      if (newConfig.isDefault) {
        updatedConfigs = updatedConfigs.map(c => ({ ...c, isDefault: false }));
      }
      updatedConfigs.push(newConfig);
      toast({ title: "SOS Configuration Added" });
    } else if (mode === 'edit' && currentConfig.id) {
      // If this edited config is set as default, unset others
      if (currentConfig.isDefault) {
        updatedConfigs = updatedConfigs.map(c => ({ ...c, isDefault: c.id === currentConfig.id }));
      }
      updatedConfigs = updatedConfigs.map(c => c.id === currentConfig.id ? { ...c, ...currentConfig } as SOSSetting : c);
      toast({ title: "SOS Configuration Updated" });
    }
    
    // Ensure only one default if multiple configs exist and one was made default
    const defaultCount = updatedConfigs.filter(c => c.isDefault).length;
    if (defaultCount > 1) { // Should ideally not happen with above logic, but as a safeguard
        const firstDefaultIndex = updatedConfigs.findIndex(c => c.isDefault);
        updatedConfigs = updatedConfigs.map((c, index) => ({...c, isDefault: index === firstDefaultIndex }));
    } else if (defaultCount === 0 && updatedConfigs.length > 0) { // If no default, make the first one default
        updatedConfigs[0].isDefault = true;
    }


    saveConfigsToStorage(updatedConfigs);
    setMode('list');
    setCurrentConfig({ ...initialNewConfigState });
  }, [currentConfig, allSosConfigs, mode, toast]);

  const handleEdit = (config: SOSSetting) => {
    setCurrentConfig({ ...config });
    setMode('edit');
  };

  const handleDelete = (idToDelete: string) => {
    let updatedConfigs = allSosConfigs.filter(c => c.id !== idToDelete);
    // If the deleted config was the default, and there are others, make the first one default
    if (updatedConfigs.length > 0 && allSosConfigs.find(c=>c.id === idToDelete)?.isDefault) {
        if (!updatedConfigs.some(c => c.isDefault)) { // check if another default already exists
            updatedConfigs[0].isDefault = true;
        }
    }
    saveConfigsToStorage(updatedConfigs);
    toast({ title: "SOS Configuration Deleted", variant: "destructive" });
    if (updatedConfigs.length === 0) { // If all deleted, go to add mode
        setMode('add');
        setCurrentConfig({ ...initialNewConfigState });
    }
  };

  const handleSetDefault = (idToSetDefault: string) => {
    const updatedConfigs = allSosConfigs.map(c => ({
      ...c,
      isDefault: c.id === idToSetDefault,
    }));
    saveConfigsToStorage(updatedConfigs);
    toast({ title: `"${updatedConfigs.find(c=>c.id===idToSetDefault)?.name}" is now the default SOS.` });
  };
  
  const handleInputChange = (field: keyof SOSSetting, value: string | boolean) => {
    setCurrentConfig(prev => ({ ...prev, [field]: value }));
  };


  const renderListView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="font-orbitron text-xl">Manage SOS Configurations</DialogTitle>
        <DialogDescription>
          Add, edit, delete, or set a default SOS message.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[50vh] pr-3">
        <div className="space-y-3 py-4">
          {allSosConfigs.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No SOS configurations found. Add one to get started.</p>
          )}
          {allSosConfigs.map((config) => (
            <Card key={config.id} className="p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold flex items-center">
                    {config.name}
                    {config.isDefault && <Badge variant="secondary" className="ml-2 text-xs py-0.5 px-1.5">Default <Star className="h-3 w-3 ml-1" /></Badge>}
                  </h4>
                  <p className="text-xs text-muted-foreground">To: {config.targetPhoneNumber}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">"{config.defaultSituation}"</p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(config)} aria-label={`Edit ${config.name}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(config.id)} aria-label={`Delete ${config.name}`} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
               {!config.isDefault && (
                <Button variant="outline" size="sm" onClick={() => handleSetDefault(config.id)} className="mt-2 text-xs">
                  Set as Default
                </Button>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Close</Button>
        <Button type="button" onClick={() => { setMode('add'); setCurrentConfig({ ...initialNewConfigState, isDefault: allSosConfigs.length === 0 }); }} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New SOS
        </Button>
      </DialogFooter>
    </>
  );

  const renderFormView = () => (
     <>
      <DialogHeader>
         <div className="flex items-center gap-2">
            {mode !== 'add' && (
                <Button variant="ghost" size="icon" onClick={() => setMode('list')} className="mr-auto -ml-2 h-8 w-8">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
            )}
            <DialogTitle className="font-orbitron text-xl">
            {mode === 'add' ? 'Add New SOS Configuration' : 'Edit SOS Configuration'}
            </DialogTitle>
        </div>
        <DialogDescription>
          {mode === 'add' ? 'Create a new SOS message template.' : `Editing "${currentConfig.name || 'SOS Configuration'}"`}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="space-y-1">
          <Label htmlFor="sos-name">Configuration Name</Label>
          <Input
            id="sos-name"
            value={currentConfig.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Hiking Emergency, Daily Check-in"
          />
          <p className="text-xs text-muted-foreground">A friendly name for this SOS setup.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="sos-phone">Emergency WhatsApp Number</Label>
          <Input
            id="sos-phone"
            value={currentConfig.targetPhoneNumber || ''}
            onChange={(e) => handleInputChange('targetPhoneNumber', e.target.value)}
            placeholder="e.g., +11234567890 (with country code)"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sos-contact-name">Contact's Display Name</Label>
          <Input
            id="sos-contact-name"
            value={currentConfig.contactDisplayName || ''}
            onChange={(e) => handleInputChange('contactDisplayName', e.target.value)}
            placeholder="e.g., Emergency Services, Mom"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sos-user-name">Your Name</Label>
          <Input
            id="sos-user-name"
            value={currentConfig.userName || ''}
            onChange={(e) => handleInputChange('userName', e.target.value)}
            placeholder="e.g., Craig Heggie"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sos-situation">Default Situation / Initial Message</Label>
          <Textarea
            id="sos-situation"
            value={currentConfig.defaultSituation || ''}
            onChange={(e) => handleInputChange('defaultSituation', e.target.value)}
            placeholder="e.g., I am in distress and need help urgently."
            rows={3}
          />
        </div>
        {allSosConfigs.length > (mode === 'add' ? 0 : 1) && ( // Show if there are other configs or if adding a new one and others exist
            <div className="flex items-center space-x-2 mt-2">
                <input
                    type="checkbox"
                    id="sos-is-default"
                    checked={currentConfig.isDefault || false}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="sos-is-default" className="text-sm font-normal">
                    Set as default SOS configuration
                </Label>
            </div>
        )}
        
        <div className="mt-4 p-3 bg-muted/50 rounded-md border">
            <h4 className="font-semibold text-sm mb-2 flex items-center"><Info className="h-4 w-4 mr-1 text-primary" /> SOS Message Structure Preview:</h4>
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

      </div>
      <DialogFooter className="pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => {setMode('list'); setCurrentConfig({...initialNewConfigState}); if(allSosConfigs.length === 0) onOpenChange(false);}}>
          {allSosConfigs.length === 0 && mode === 'add' ? 'Cancel' : 'Back to List'}
        </Button>
        <Button type="button" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Configuration
        </Button>
      </DialogFooter>
    </>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] flex flex-col">
        {mode === 'list' ? renderListView() : renderFormView()}
      </DialogContent>
    </Dialog>
  );
}

// Minimal Card component for local use if not importing globally
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground", className, props.onClick ? "cursor-pointer hover:shadow-md" : "")}
      {...props}
    />
  )
);
Card.displayName = "Card";

// Minimal cn utility for local use
function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

