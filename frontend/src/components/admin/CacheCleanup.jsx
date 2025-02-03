import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, AlertCircle, RefreshCw } from "lucide-react";

const CacheCleanup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modelStatus, setModelStatus] = useState({
    initialized: false,
    modelLoaded: false,
    timestamp: null,
  });

  const fetchStatus = async () => {
    try {
      const response = await axios.get("/coach/status");
      setModelStatus(response.data);
    } catch (err) {
      console.error("Failed to fetch AI status:", err);
      setError("Failed to fetch AI model status");
    }
  };

  const handleClearCache = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.get("/coach/clear-cache");
      setSuccess("Successfully cleared AI model cache");
      await fetchStatus(); // Refresh status after clearing cache
    } catch (err) {
      console.error("Cache cleanup failed:", err);
      setError("Failed to clear AI model cache");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Model Cache Management
        </CardTitle>
        <CardDescription>
          Manage and clean up AI model cache to free up resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Model Status</p>
              <p className="text-2xl font-bold text-blue-700">
                {modelStatus.initialized ? "Initialized" : "Not Initialized"}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Model Loaded</p>
              <p className="text-2xl font-bold text-green-700">
                {modelStatus.modelLoaded ? "Yes" : "No"}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600">Last Updated</p>
              <p className="text-lg font-bold text-purple-700">
                {modelStatus.timestamp
                  ? new Date(modelStatus.timestamp).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Cache Management</h3>
            <div className="flex gap-4">
              <Button
                onClick={handleClearCache}
                disabled={loading}
                variant="destructive"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4 mr-2" />
                )}
                {loading ? "Clearing Cache..." : "Clear AI Model Cache"}
              </Button>
              <Button
                onClick={fetchStatus}
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Clearing the cache will free up system resources but may cause a
                brief interruption in AI services while the model reloads.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheCleanup;
