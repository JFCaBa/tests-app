import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Trash2, AlertCircle } from "lucide-react";
import ConfirmDialog from "../common/ConfirmDialog";

const ChatCleanup = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDays, setSelectedDays] = useState("30");
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/chat/messages/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch chat stats:", err);
      setError("Failed to fetch chat statistics");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCleanup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("/admin/messages/cleanup", {
        daysToKeep: parseInt(selectedDays),
      });

      setSuccess(
        `Successfully cleaned up ${response.data.deletedCount} messages`
      );
      fetchStats(); // Refresh stats after cleanup
    } catch (err) {
      console.error("Cleanup failed:", err);
      setError("Failed to clean up messages");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalStats = () => {
    return stats.reduce(
      (acc, curr) => ({
        messageCount: (acc.messageCount || 0) + curr.messageCount,
        userMessages: (acc.userMessages || 0) + curr.userMessages,
        botMessages: (acc.botMessages || 0) + curr.botMessages,
        errors: (acc.errors || 0) + curr.errors,
      }),
      {}
    );
  };

  const totalStats = calculateTotalStats();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat Message Cleanup
          </CardTitle>
          <CardDescription>
            Manage and clean up chat message history
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Messages</p>
                <p className="text-2xl font-bold text-blue-700">
                  {totalStats.messageCount || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">User Messages</p>
                <p className="text-2xl font-bold text-green-700">
                  {totalStats.userMessages || 0}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Bot Messages</p>
                <p className="text-2xl font-bold text-purple-700">
                  {totalStats.botMessages || 0}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">Errors</p>
                <p className="text-2xl font-bold text-red-700">
                  {totalStats.errors || 0}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Messages by Subject</h3>
              <div className="grid gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat._id || "general"}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium capitalize">
                      {stat._id || "General"}
                    </span>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{stat.messageCount} messages</span>
                      <span>{stat.errors} errors</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cleanup Options</h3>
              <div className="flex gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Keep messages from last
                  </label>
                  <Select value={selectedDays} onValueChange={setSelectedDays}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {loading ? "Cleaning up..." : "Clean Up Messages"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCleanup}
        title="Clean Up Chat Messages"
        description={`Are you sure you want to delete chat messages older than ${selectedDays} days? This action cannot be undone.`}
        confirmText="Clean Up"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};

export default ChatCleanup;
