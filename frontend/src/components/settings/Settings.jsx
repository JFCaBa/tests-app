import React, { useState, useEffect } from "react";
import { useSettings } from "../../contexts/SettingsContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings as SettingsIcon,
  Bell,
  Clock,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SEOHead from "../SEOHead";

export const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [preferences, setPreferences] = useState({ ...settings });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update local preferences when settings change
  useEffect(() => {
    setPreferences({ ...settings });
  }, [settings]);

  const subjects = [
    { id: "listening", name: "Listening" },
    { id: "grammar", name: "Grammar" },
    { id: "history", name: "History" },
    { id: "laws", name: "Laws" },
    { id: "reading", name: "Reading" },
    { id: "writing", name: "Writing" },
  ];

  const handleToggleSubject = (subjectId) => {
    setPreferences((prev) => {
      const currentSubjects = prev.preferredSubjects || [];
      const updatedSubjects = currentSubjects.includes(subjectId)
        ? currentSubjects.filter((id) => id !== subjectId)
        : [...currentSubjects, subjectId];

      return {
        ...prev,
        preferredSubjects: updatedSubjects,
      };
    });
  };

  const handleNotificationToggle = () => {
    setPreferences((prev) => ({
      ...prev,
      notificationEnabled: !prev.notificationEnabled,
    }));
  };

  const handleDifficultyChange = (value) => {
    setPreferences((prev) => ({
      ...prev,
      defaultDifficulty: value,
    }));
  };

  const handleQuestionsPerTestChange = (value) => {
    setPreferences((prev) => ({
      ...prev,
      questionsPerTest: parseInt(value),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Make a deep copy of preferences to ensure no reference issues
      const updatedSettings = JSON.parse(JSON.stringify(preferences));
      await updateSettings(updatedSettings);
      setSuccess("Settings updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update settings");
      // Revert to previous settings on error
      setPreferences({ ...settings });
    } finally {
      setLoading(false);
    }
  };

  // Reset function in case something goes wrong
  const handleReset = () => {
    setPreferences({ ...settings });
    setError("");
    setSuccess("");
  };

  return (
    <>
      <SEOHead 
        title="Settings | Test My Russian" 
        description="Configure your Test My Russian learning preferences and settings" 
        noIndex={true}
      />
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              <Bell className="w-5 h-5 inline-block mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable notifications</Label>
              <Switch
                id="notifications"
                checked={preferences.notificationEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <BookOpen className="w-5 h-5 inline-block mr-2" />
              Preferred Subjects
            </CardTitle>
            <CardDescription>
              Select your preferred subjects for practice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <Switch
                    id={subject.id}
                    checked={preferences.preferredSubjects?.includes(subject.id)}
                    onCheckedChange={() => handleToggleSubject(subject.id)}
                  />
                  <Label htmlFor={subject.id}>{subject.name}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Clock className="w-5 h-5 inline-block mr-2" />
              Test Preferences
            </CardTitle>
            <CardDescription>
              Configure your default test settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Default Difficulty</Label>
              <Select
                value={preferences.defaultDifficulty}
                onValueChange={handleDifficultyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Разрешение на работу</SelectItem>
                  <SelectItem value="medium">
                    Разрешение на временное проживание
                  </SelectItem>
                  <SelectItem value="hard">Вид на жительство</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Questions per Test</Label>
              <Select
                value={preferences.questionsPerTest?.toString()}
                onValueChange={handleQuestionsPerTestChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of questions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            Reset Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Settings;
