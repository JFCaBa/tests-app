import React, { useState, useRef } from "react";
import { Play, Pause, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import TextToSpeech from "@/components/common/TextToSpeech";

export const AudioQuestion = ({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  // Add this at the beginning of the AudioQuestion component
  console.log("Audio Question Data:", {
    questionText: question.question,
    transcription: question.transcription,
    fullQuestion: question,
  });

  // Get the audio URL directly from backend
  const getAudioUrl = (audioPath) => {
    if (!audioPath) return "";
    const filename = audioPath.split("/").pop();
    return `https://testmyrussian.com/uploads/audio/${filename}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio playback failed:", error);
          setError("Failed to play audio. Please try again.");
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const progress =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(progress);
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          {/* Original audio controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayPause}
                className="h-12 w-12"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleReplay}
                className="h-8 w-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleMute}
                className="h-8 w-8"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Progress value={progress} className="w-1/2" />
          </div>

          <audio
            ref={audioRef}
            src={getAudioUrl(question.audioUrl)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={(e) => {
              console.error("Audio error:", e);
              setError("Failed to load audio file");
            }}
          />

          {/* Text to Speech for explanation */}
          {question.explanation && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Listen to explanation:
                </span>
                <TextToSpeech
                  text={question.explanation}
                  language="ru-RU"
                  size="sm"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {question.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswer === index ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onAnswer(index)}
            disabled={disabled}
          >
            {option.text}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AudioQuestion;
