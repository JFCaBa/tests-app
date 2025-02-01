import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TextToSpeech = ({
  text,
  className,
  size = "sm",
  voices = [],
  language = "ru-RU",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    // Get available voices
    const loadVoices = () => {
      const synthesis = window.speechSynthesis;
      const voiceList = synthesis.getVoices();
      // Filter voices by language if specified
      const filteredVoices = language
        ? voiceList.filter((voice) => voice.lang.startsWith(language))
        : voiceList;
      setAvailableVoices(filteredVoices);

      // Set default voice
      if (filteredVoices.length > 0) {
        setSelectedVoice(filteredVoices[0]);
      }
    };

    // Chrome needs a delay to load voices
    const synthesis = window.speechSynthesis;
    if (synthesis.onvoiceschanged !== undefined) {
      synthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();

    // Cleanup
    return () => {
      if (synthesis.speaking) {
        synthesis.cancel();
      }
    };
  }, [language]);

  const handlePlay = () => {
    const synthesis = window.speechSynthesis;

    if (isPaused) {
      synthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (synthesis.speaking) {
      synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = language;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePause = () => {
    const synthesis = window.speechSynthesis;
    if (synthesis.speaking) {
      synthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleVoiceChange = (voiceName) => {
    const voice = availableVoices.find((v) => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size={size}
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={!text}
        className="min-w-[40px]"
      >
        {isPlaying ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      {(isPlaying || isPaused) && (
        <Button
          variant="outline"
          size={size}
          onClick={handleStop}
          className="min-w-[40px]"
        >
          <StopCircle className="h-4 w-4" />
        </Button>
      )}

      {availableVoices.length > 1 && (
        <Select value={selectedVoice?.name} onValueChange={handleVoiceChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {availableVoices.map((voice) => (
              <SelectItem key={voice.name} value={voice.name}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default TextToSpeech;
