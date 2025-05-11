"use client";

import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BellOff, Settings, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const INSTANT_ALARM_DURATION_SECONDS = 20;
const MIN_CONFIG_DURATION_SECONDS = 5;
const MAX_CONFIG_DURATION_SECONDS = 120;
const DEFAULT_CONFIG_DURATION_SECONDS = 30;
const DEFAULT_CONFIG_VOLUME_PERCENT = 75;
type SirenType = "sine" | "square" | "sawtooth" | "triangle";
const DEFAULT_SIREN_TYPE: SirenType = "sine";


export function AlarmButton() {
  const [isAlarming, setIsAlarming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentAlarmType, setCurrentAlarmType] = useState<'instant' | 'configured' | null>(null);
  
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configDuration, setConfigDuration] = useState(DEFAULT_CONFIG_DURATION_SECONDS);
  const [configVolumePercent, setConfigVolumePercent] = useState(DEFAULT_CONFIG_VOLUME_PERCENT); // 0-100
  const [configSirenType, setConfigSirenType] = useState<SirenType>(DEFAULT_SIREN_TYPE);

  const { toast } = useToast();

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
  
  const startAlarmSound = useCallback(async (durationSeconds: number, volumePercent: number, sirenType: SirenType) => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log("AudioContext started by Tone.js");
      }
      
      stopAlarmSound(); // Clear any previous instances

      const newSiren = new Tone.Oscillator(440, sirenType).toDestination();
      
      // Map volumePercent (0-100) to dB (-Infinity or -60dB to 0dB)
      // 0% = very quiet (-60dB), 100% = max (0dB)
      // Instant alarm will use 100% (0dB)
      const dbVolume = volumePercent === 0 ? -Infinity : -50 + (volumePercent / 100) * 50;
      newSiren.volume.value = dbVolume;

      const newLfo = new Tone.LFO({
        frequency: 2, 
        min: 440,
        max: 880,
        type: "sine" // LFO type can also be configurable if needed
      }).connect(newSiren.frequency);
      
      newLfo.start();
      newSiren.start();

      setSiren(newSiren);
      setLfo(newLfo);
      setTimeLeft(durationSeconds);
      setIsAlarming(true);

    } catch (error) {
      console.error("Error starting alarm sound:", error);
      toast({
        title: "Audio Error",
        description: "Could not start alarm sound. Please check browser permissions or try again.",
        variant: "destructive",
      });
      setIsAlarming(false); 
      setCurrentAlarmType(null);
    }
  }, [toast, stopAlarmSound]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (isAlarming && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerId!);
            setIsAlarming(false);
            setCurrentAlarmType(null);
            stopAlarmSound();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isAlarming) {
        setIsAlarming(false);
        setCurrentAlarmType(null);
        stopAlarmSound();
    }

    return () => {
      if (timerId) clearInterval(timerId);
      // Ensure sound stops if component unmounts while alarming
      // or if isAlarming becomes false for other reasons
      if (isAlarming) {
         stopAlarmSound();
      }
    };
  }, [isAlarming, timeLeft, stopAlarmSound]);

  const handleInstantAlarm = () => {
    if (isAlarming) return;
    setCurrentAlarmType('instant');
    startAlarmSound(INSTANT_ALARM_DURATION_SECONDS, 100, DEFAULT_SIREN_TYPE); // Max volume (100%)
  };

  const handleStartConfiguredAlarm = () => {
    if (isAlarming) return;
    setCurrentAlarmType('configured');
    startAlarmSound(configDuration, configVolumePercent, configSirenType);
    setIsConfiguring(false); // Close dialog
  };

  const handleStopAlarm = () => {
    setIsAlarming(false);
    setCurrentAlarmType(null);
    setTimeLeft(0);
    stopAlarmSound();
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-orbitron uppercase tracking-wide flex items-center gap-2">
          <AlertTriangle className={`h-6 w-6 ${isAlarming ? 'text-destructive animate-ping' : 'text-secondary'}`} />
          Alarm Mode
        </CardTitle>
        {isAlarming ? (
           <CardDescription>
            {currentAlarmType === 'instant' ? 'Instant alarm active.' : 'Configured alarm active.'} Sounding for {formatTimeLeft(timeLeft)}.
          </CardDescription>
        ) : (
           <CardDescription>
            Activate a loud siren. Use with caution.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAlarming ? (
          <Button 
            onClick={handleStopAlarm} 
            variant="destructive"
            className="w-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <BellOff className="mr-2 h-4 w-4" />
            Stop Alarm ({formatTimeLeft(timeLeft)})
          </Button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={handleInstantAlarm} 
              variant="secondary"
              className="w-full transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Instant Alarm ({INSTANT_ALARM_DURATION_SECONDS}s)
            </Button>

            <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="w-full transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Alarm
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Configure Alarm</DialogTitle>
                  <DialogDescription>
                    Set the duration, volume, and type of siren for the alarm.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration-slider">Duration: {configDuration} seconds</Label>
                    <Slider
                      id="duration-slider"
                      min={MIN_CONFIG_DURATION_SECONDS}
                      max={MAX_CONFIG_DURATION_SECONDS}
                      step={5}
                      value={[configDuration]}
                      onValueChange={(value) => setConfigDuration(value[0])}
                      aria-label="Alarm duration slider"
                    />
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{MIN_CONFIG_DURATION_SECONDS}s</span>
                        <span>{MAX_CONFIG_DURATION_SECONDS}s</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="volume-slider">Volume: {configVolumePercent}%</Label>
                    <Slider
                      id="volume-slider"
                      min={0}
                      max={100}
                      step={1}
                      value={[configVolumePercent]}
                      onValueChange={(value) => setConfigVolumePercent(value[0])}
                      aria-label="Alarm volume slider"
                    />
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mute</span>
                        <span>Max</span>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="siren-type">Siren Type</Label>
                    <Select value={configSirenType} onValueChange={(value: string) => setConfigSirenType(value as SirenType)}>
                      <SelectTrigger id="siren-type" aria-label="Siren type selector">
                        <SelectValue placeholder="Select siren type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sine">Sine (Classic)</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="sawtooth">Sawtooth</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="button" onClick={handleStartConfiguredAlarm}>Start Configured Alarm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
         {!isAlarming && (
           <p className="text-sm text-muted-foreground mt-2 text-center">
             Instant alarm plays for {INSTANT_ALARM_DURATION_SECONDS}s. Configurable alarm offers more options.
           </p>
        )}
      </CardContent>
    </Card>
  );
}
