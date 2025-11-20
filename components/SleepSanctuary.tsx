
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Moon, Clock, Volume2, Loader2 } from 'lucide-react';

const SleepSanctuary: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState<'white' | 'pink' | 'rain'>('white');
  
  // Audio Generation Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Smart Detection Refs & State
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const monitorIntervalRef = useRef<number | null>(null);

  const [lastWakeTime, setLastWakeTime] = useState<string>('07:00');
  const [babyAgeMonths] = useState<number>(4);
  const [nextSleepTime, setNextSleepTime] = useState<string>('');

  // Wake Window Calculator Logic
  useEffect(() => {
    if (!lastWakeTime) return;

    let windowMinutes = 60;
    if (babyAgeMonths < 3) windowMinutes = 60;
    else if (babyAgeMonths < 6) windowMinutes = 90;
    else if (babyAgeMonths < 12) windowMinutes = 150;
    else windowMinutes = 240;

    const [hours, minutes] = lastWakeTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + windowMinutes);

    setNextSleepTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [lastWakeTime, babyAgeMonths]);

  // --- AUDIO ENGINE (GENERATION) ---
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound();
    }
  };

  const startSound = () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    
    // Stop existing before starting new
    if (sourceNodeRef.current) {
       sourceNodeRef.current.stop();
    }
    
    // Create Noise Buffer
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (soundType === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (soundType === 'pink') {
       let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
       for (let i = 0; i < bufferSize; i++) {
         const white = Math.random() * 2 - 1;
         b0 = 0.99886 * b0 + white * 0.0555179;
         b1 = 0.99332 * b1 + white * 0.0750759;
         b2 = 0.96900 * b2 + white * 0.1538520;
         b3 = 0.86650 * b3 + white * 0.3104856;
         b4 = 0.55000 * b4 + white * 0.5329522;
         b5 = -0.7616 * b5 - white * 0.0168980;
         data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
         data[i] *= 0.11; // Compensate gain
         b6 = white * 0.115926;
       }
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.05; // Start soft

    noiseSource.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();
    sourceNodeRef.current = noiseSource;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);
  };

  const stopSound = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) { /* ignore if already stopped */ }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  // --- SMART DETECTION LOGIC ---
  const toggleSmartMode = async () => {
    if (isSmartMode) {
      // Turn off
      setIsSmartMode(false);
      stopMonitoring();
    } else {
      // Turn on
      setIsInitializing(true);
      try {
        await startMonitoring();
        setIsSmartMode(true);
      } catch (err) {
        console.error("Microphone access denied", err);
        alert("Please allow microphone access to use Smart Cry Detection.");
      } finally {
        setIsInitializing(false);
      }
    }
  };

  const startMonitoring = async () => {
    const ctx = getAudioContext();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const microphone = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      
      microphone.connect(analyser);
      
      microphoneRef.current = microphone;
      analyserRef.current = analyser;
      setIsMonitoring(true);

      // Start Loop
      monitorIntervalRef.current = window.setInterval(() => {
        // If sound is already playing, don't monitor (avoid feedback loop)
        if (sourceNodeRef.current) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for(let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // Threshold for "Crying"
        if (average > 40) {
          startSound();
        }
      }, 1000); 

    } catch (e) {
      console.error("Error starting microphone", e);
      throw e;
    }
  };

  const stopMonitoring = () => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
    if (microphoneRef.current) {
      // Stop all tracks to release microphone
      if (microphoneRef.current.mediaStream) {
          microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
      }
      try {
        microphoneRef.current.disconnect();
      } catch(e) {}
      microphoneRef.current = null;
    }
    setIsMonitoring(false);
  };

  // Cleanup on unmount is CRITICAL
  useEffect(() => {
    return () => {
      stopSound();
      stopMonitoring();
      // Close context to free audio hardware resources
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-dark mb-2">Sleep Sanctuary</h2>
        <p className="text-gray-500">Science-based tools for better baby sleep</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sound Machine */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-1000 ${isPlaying ? 'bg-secondary/20 shadow-[0_0_40px_rgba(133,227,255,0.6)] scale-105' : 'bg-gray-100'}`}>
            <Volume2 size={48} className={isPlaying ? 'text-secondary animate-pulse' : 'text-gray-400'} />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-4">Smart Noise Machine</h3>
          
          <div className="flex gap-2 mb-8">
             {(['white', 'pink'] as const).map(type => (
               <button
                key={type}
                onClick={() => { if(isPlaying) stopSound(); setSoundType(type); }}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${soundType === type ? 'bg-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
               >
                 {type} Noise
               </button>
             ))}
          </div>

          <button
            onClick={toggleSound}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isPlaying ? 'bg-primary text-white shadow-lg hover:bg-red-400' : 'bg-dark text-white shadow-xl hover:bg-black'}`}
          >
            {isPlaying ? <><Pause fill="currentColor" /> Pause</> : <><Play fill="currentColor" /> Play Sound</>}
          </button>
        </div>

        {/* Sleep Calculator & Smart Monitor */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative">
            <div className="absolute top-4 right-4 bg-accent/20 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Anti-Overtired
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="text-primary" /> Wake Windows
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Woke Up At</label>
                <input 
                    type="time" 
                    value={lastWakeTime}
                    onChange={(e) => setLastWakeTime(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="mt-4 p-4 bg-secondary/10 rounded-2xl border border-secondary/30 text-center">
                <span className="block text-sm text-gray-500 mb-1">Next nap should start by</span>
                <div className="text-4xl font-bold text-dark tracking-tight">{nextSleepTime}</div>
              </div>
            </div>
          </div>

          {/* Real Smart Monitor */}
          <div className={`rounded-3xl p-6 shadow-lg transition-all border ${isSmartMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
               <h3 className={`text-lg font-bold flex items-center gap-2 ${isSmartMode ? 'text-white' : 'text-gray-800'}`}>
                 <Moon className={isSmartMode ? 'text-yellow-400' : 'text-primary'} size={20}/> 
                 Smart Cry Detection
               </h3>
               <button 
                 onClick={toggleSmartMode}
                 disabled={isInitializing}
                 className={`w-12 h-6 rounded-full relative transition-colors ${isSmartMode ? 'bg-green-500' : isInitializing ? 'bg-gray-200 cursor-wait' : 'bg-gray-300'}`}
               >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all flex items-center justify-center ${isSmartMode ? 'left-7' : 'left-1'}`}>
                   {isInitializing && <Loader2 size={10} className="animate-spin text-gray-500"/>}
                 </div>
               </button>
            </div>
            
            <p className={`text-sm mb-4 ${isSmartMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isSmartMode 
                ? isMonitoring 
                  ? "Listening for cries... Noise will auto-start." 
                  : "Initializing microphone..." 
                : "Uses microphone to detect crying and auto-plays soothing sounds."}
            </p>

            {isSmartMode && isMonitoring && (
              <div className="flex items-center gap-3">
                 <div className="flex gap-1 h-4 items-end">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-1 bg-green-500 rounded-full animate-pulse" style={{height: `${Math.random() * 100}%`, animationDuration: `${Math.random() * 0.5 + 0.2}s`}}></div>
                    ))}
                 </div>
                 <span className="text-xs font-mono text-green-400">ACTIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepSanctuary;
