
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MapPin, Share2, Navigation, AlertTriangle, Palette, TimerIcon, Globe, Volume2, Settings2, LifeBuoy, Settings } from 'lucide-react'; // Added Settings

interface HowToModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Constants defined in GeoDropForm, AlarmButton - ensure these are consistent if used directly
const MIN_LIFESPAN_MINUTES = 5;
const MAX_LIFESPAN_MINUTES = 120;
const INSTANT_ALARM_DURATION_SECONDS = 20;
const MIN_CONFIG_DURATION_SECONDS = 5;
const MAX_CONFIG_DURATION_SECONDS = 120;
const DEFAULT_SIREN_TYPE = "sine";


export function HowToModal({ isOpen, onOpenChange }: HowToModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-2xl">How to Use HegGeo</DialogTitle>
          <DialogDescription>
            Learn how to use the features of HegGeo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 py-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="geo-dropping">
              <AccordionTrigger className="text-lg font-semibold">
                <MapPin className="mr-2 h-5 w-5 text-primary" /> GeoDropping
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-2 pl-2">
                <p>Mark your current location with a temporary 'Geo'.</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Your current location is detected automatically. If not, ensure location services are enabled in your browser and for this site.</li>
                  <li>Use the 'Geo Lifespan' slider to set how long your Geo will be active (from {MIN_LIFESPAN_MINUTES} to {MAX_LIFESPAN_MINUTES} minutes).</li>
                  <li>Click the 'Drop Geo' button.</li>
                  <li>Your active Geo will appear on the map placeholder and its details will be shown in the 'Active Geo' card below the form.</li>
                  <li>To remove an active Geo before it expires, click 'Clear Active Geo'.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="active-geo-sharing">
              <AccordionTrigger className="text-lg font-semibold">
                <Share2 className="mr-2 h-5 w-5 text-primary" /> Active Geo & Sharing
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-2 pl-2">
                <p>View details of your active Geo and share it with others.</p>
                <p><strong>Viewing Active Geo:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Once a Geo is dropped, its details (time remaining, coordinates, drop time, total lifespan) are displayed in the 'Active Geo' card.</li>
                </ul>
                <p className="mt-2"><strong>Sharing on WhatsApp:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>In the 'Active Geo' card, click the 'Share Geo' button.</li>
                  <li>A dialog will appear. You can (optionally) add a custom text message.</li>
                  <li>Review the pre-filled message. If you want to add a photo, you will need to do this manually in WhatsApp after the chat opens.</li>
                  <li>Click the 'Share to WhatsApp' button in the dialog.</li>
                  <li>This will open WhatsApp with a pre-filled message. The message includes:
                    <ul className="list-disc list-inside ml-4">
                        <li>A greeting and statement about your location.</li>
                        <li>The address of your Geo.</li>
                        <li>Your custom message (if any).</li>
                        <li>A Google Maps link to your Geo's location.</li>
                        <li>The #HegGeo hashtag.</li>
                        <li>A link to the HegGeo application.</li>
                    </ul>
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="journey-tracker">
              <AccordionTrigger className="text-lg font-semibold">
                <Navigation className="mr-2 h-5 w-5 text-primary" /> Journey Time Tracker
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-2 pl-2">
                <p>Calculate estimated driving distance and travel time between two locations.</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>Source Location:</strong> Enter an address, place name, or coordinates (e.g., "40.7128,-74.0060"). Alternatively, click the <LocateFixed className="inline h-4 w-4" /> icon to use your current location (if available).</li>
                  <li><strong>Destination Location:</strong> Enter details similarly for the destination, or use the <LocateFixed className="inline h-4 w-4" /> icon.</li>
                  <li>Click 'Calculate Journey'.</li>
                  <li>The results, including identified source/destination names, distance (km/meters), and estimated duration (hours/minutes/seconds), will be displayed.</li>
                  <li>This feature uses OpenStreetMap Nominatim for geocoding and OSRM for route calculation.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="alarm-mode">
              <AccordionTrigger className="text-lg font-semibold">
                <AlertTriangle className="mr-2 h-5 w-5 text-primary" /> Alarm Mode
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-2 pl-2">
                <p>Activate a siren sound. <strong className="text-destructive">Use with caution and responsibly.</strong></p>
                <p><strong><PlayCircle className="inline h-4 w-4 text-secondary" /> Instant Alarm:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click the 'Instant Alarm' button.</li>
                  <li>This will play a siren for {INSTANT_ALARM_DURATION_SECONDS} seconds at maximum volume ({DEFAULT_SIREN_TYPE} wave by default).</li>
                </ul>
                 <p className="mt-2"><strong><Settings2 className="inline h-4 w-4 text-secondary" /> Configured Alarm:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the 'Configure Alarm' button to open the settings dialog.</li>
                  <li><strong><TimerIcon className="inline h-4 w-4" /> Duration:</strong> Adjust the slider to set how long the alarm will sound (from {MIN_CONFIG_DURATION_SECONDS} to {MAX_CONFIG_DURATION_SECONDS} seconds).</li>
                  <li><strong><Volume2 className="inline h-4 w-4" /> Volume:</strong> Adjust the slider to set the alarm volume (0% to 100%).</li>
                  <li><strong><Globe className="inline h-4 w-4" /> Siren Type:</strong> Select the type of sound wave for the siren (e.g., Sine, Square, Sawtooth, Triangle).</li>
                  <li>Click 'Start Configured Alarm' in the dialog.</li>
                </ol>
                <p className="mt-2"><strong>Stopping the Alarm:</strong></p>
                <ul className="list-disc list-inside">
                  <li>While an alarm is active (either instant or configured), the button will change to 'Stop Alarm'. Click it to silence the alarm immediately.</li>
                  <li>The alarm will also stop automatically when its duration runs out.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sos-mode">
              <AccordionTrigger className="text-lg font-semibold">
                <LifeBuoy className="mr-2 h-5 w-5 text-destructive" /> SOS Mode
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-2 pl-2">
                <p>Quickly send a pre-configured emergency message via WhatsApp.</p>
                <p><strong><Settings2 className="inline h-4 w-4 text-primary" /> Setting up SOS:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the <Settings className="inline h-4 w-4" /> icon in the header, then select 'Configure SOS'.</li>
                  <li>In the dialog, enter:
                      <ul className="list-disc list-inside ml-4">
                          <li><strong>Emergency WhatsApp Number:</strong> The phone number (with country code, e.g., +11234567890) of your emergency contact.</li>
                          <li><strong>Contact's Display Name:</strong> How the contact is addressed in the message (e.g., "Mom", "Emergency Services").</li>
                          <li><strong>Your Name:</strong> Your name as it will appear.</li>
                          <li><strong>Default Situation:</strong> A brief description of a typical emergency (e.g., "I am in distress and need help."). You can include details like WHO, WHAT, CONDITION, NEEDS.</li>
                      </ul>
                  </li>
                  <li>Click 'Save SOS Settings'. This information is stored locally on your device.</li>
                </ol>
                <p className="mt-2"><strong><AlertTriangle className="inline h-4 w-4 text-destructive" /> Sending an SOS:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the red 'SOS' button in the header.</li>
                  <li>If not configured, you'll be prompted to set it up.</li>
                  <li>If configured, the app will get your current location.</li>
                  <li>WhatsApp will open with a pre-filled message to your emergency contact, including:
                      <ul className="list-disc list-inside ml-4">
                          <li>The contact's display name.</li>
                          <li>Your name.</li>
                          <li>Your default situation message.</li>
                          <li>Your current address and a Google Maps link to your location.</li>
                          <li>The #HegGeo hashtag and app link.</li>
                      </ul>
                  </li>
                  <li>You just need to press 'Send' in WhatsApp.</li>
                </ol>
                <p className="mt-1 font-semibold text-destructive">Use this feature responsibly and only in genuine emergencies.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="theme-switcher">
              <AccordionTrigger className="text-lg font-semibold">
                <Palette className="mr-2 h-5 w-5 text-primary" /> Theme Customization
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-2 pl-2">
                <p>Change the app's appearance.</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the <Settings className="inline h-4 w-4" /> icon in the header.</li>
                  <li>Under the 'Theme' section in the dropdown, select from:
                    <ul className="list-disc list-inside ml-4">
                      <li>Light (Default)</li>
                      <li>Dark</li>
                      <li>High Contrast Light</li>
                      <li>High Contrast Dark</li>
                    </ul>
                  </li>
                  <li>The theme updates immediately and is saved in your browser.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Helper icons used in HowToModal that might not be globally available easily.
// Re-defining them here if they were not part of an earlier import
const PlayCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
);

const LocateFixed = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>
);

