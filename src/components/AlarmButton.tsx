"use client";

import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ALARM_DURATION_SECONDS = 20;

export function AlarmButton() {
  const [isAlarming, setIsAlarming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ALARM_DURATION_SECONDS);
  const { toast } = useToast();

  // Memoize Tone objects to avoid recreation on every render.
  // These will be initialized on demand.
  const [siren, setSiren] = useState<Tone.Oscillator | null>(null);
  const [lfo, setLfo] = useState<Tone.LFO | null>(null);


  const stopAlarmSound = useCallback(() => {
    if (lfo) {
      lfo.stop();
      lfo.dispose();
      setLfo(null);
    }
    if (siren) {
      siren.stop();
      siren.dispose();
      setSiren(null);
    }
  }, [siren, lfo]);
  
  const startAlarmSound = useCallback(async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      stopAlarmSound(); // Clear any previous instances

      const newSiren = new Tone.Oscillator(440, "sine").toDestination();
      newSiren.volume.value = 0; // Max volume (0dB)

      const newLfo = new Tone.LFO({
        frequency: 2, // 2 Hz, for a classic siren sweep
        min: 440,
        max: 880,
        type: "sine"
      }).connect(newSiren.frequency);
      
      newLfo.start();
      newSiren.start();

      setSiren(newSiren);
      setLfo(newLfo);

    } catch (error) {
      console.error("Error starting alarm sound:", error);
      toast({
        title: "Audio Error",
        description: "Could not start alarm sound. Please check browser permissions.",
        variant: "destructive",
      });
      setIsAlarming(false); // Ensure state is reset if sound fails
    }
  }, [toast, stopAlarmSound]);


  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (isAlarming) {
      setTimeLeft(ALARM_DURATION_SECONDS);
      startAlarmSound();
      timerId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerId!);
            setIsAlarming(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      stopAlarmSound();
      if (timerId) clearInterval(timerId);
    }

    return () => {
      if (timerId) clearInterval(timerId);
      stopAlarmSound(); // Cleanup on component unmount
    };
  }, [isAlarming, startAlarmSound, stopAlarmSound]);

  const toggleAlarm = () => {
    setIsAlarming(!isAlarming);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
          <AlertTriangle className={`h-6 w-6 ${isAlarming ? 'text-destructive animate-ping' : 'text-secondary'}`} />
          Alarm Mode
        </CardTitle>
        <CardDescription>
          Activate a loud siren sound. Use with caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={toggleAlarm} 
          variant={isAlarming ? "destructive" : "secondary"}
          className="w-full transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {isAlarming ? (
            <>
              <BellOff className="mr-2 h-4 w-4" />
              Stop Alarm ({timeLeft}s)
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Activate Alarm
            </>
          )}
        </Button>
        {isAlarming && (
           <p className="text-sm text-muted-foreground mt-2 text-center">
             Alarm active! Sound will play for {ALARM_DURATION_SECONDS} seconds.
           </p>
        )}
         {!isAlarming && (
           <p className="text-sm text-muted-foreground mt-2 text-center">
             Plays a siren for {ALARM_DURATION_SECONDS} seconds.
           </p>
        )}
      </CardContent>
    </Card>
  );
}

// Need to add Card to imports if not already there from other components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
