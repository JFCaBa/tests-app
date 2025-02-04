import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Book, X, MousePointerClick, Search } from "lucide-react";

const TranslationAnnouncement = () => {
  const [showFeature, setShowFeature] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Check if user has seen the feature announcement
    const hasSeenFeature = localStorage.getItem("hasSeenTranslationFeature");

    if (!hasSeenFeature) {
      // Show the announcement after a short delay
      const timer = setTimeout(() => {
        setShowFeature(true);
      }, 3000); // Show after user has had a chance to see the landing page

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowFeature(false);
    localStorage.setItem("hasSeenTranslationFeature", "true");
  };

  const showDemoGuide = () => {
    setShowFeature(false);
    setShowGuide(true);
    localStorage.setItem("hasSeenTranslationFeature", "true");
  };

  if (!showFeature && !showGuide) return null;

  return (
    <>
      {showFeature && (
        <div className="fixed left-1/2 bottom-8 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <Card className="w-96 bg-white shadow-lg border-blue-200 border-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Book className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">
                    Instant Translation Available!
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 mt-2">
                <MousePointerClick className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-600">
                  Select any Russian text on the page to see its instant English
                  translation
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleDismiss}
                >
                  Got it
                </Button>
                <Button size="sm" className="w-full" onClick={showDemoGuide}>
                  Show Example
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      <AlertDialog open={showGuide} onOpenChange={setShowGuide}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-500" />
              How to Use Translation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MousePointerClick className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm">
                    Click and drag to select any Russian text on the page
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Search className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm">
                    A translation popup will appear below the selected text
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <X className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-sm">
                    Click anywhere else to dismiss the translation
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Try it out! This feature works everywhere in the app to help
                  you learn and understand Russian text.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Start Using</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TranslationAnnouncement;
