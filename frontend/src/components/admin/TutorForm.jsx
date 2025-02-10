import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import axios from "axios";

const subjects = [
  "listening",
  "grammar",
  "history",
  "laws",
  "reading",
  "writing",
];

const TutorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subjects: [],
    hourlyRate: "",
    bio: "",
    active: true,
  });

  useEffect(() => {
    if (id) {
      fetchTutor();
    }
  }, [id]);

  const fetchTutor = async () => {
    try {
      const response = await axios.get(`/admin/tutors/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error("Failed to fetch tutor:", error);
      setError("Failed to load tutor data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        hourlyRate: Number(formData.hourlyRate),
      };

      if (id) {
        await axios.put(`/admin/tutors/${id}`, data);
      } else {
        await axios.post("/admin/tutors", data);
      }

      navigate("/admin/tutors");
    } catch (error) {
      console.error("Failed to save tutor:", error);
      setError(error.response?.data?.message || "Failed to save tutor");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subject) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{id ? "Edit Tutor" : "Add New Tutor"}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/tutors")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Subjects</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {subjects.map((subject) => (
                    <Button
                      key={subject}
                      type="button"
                      variant={
                        formData.subjects.includes(subject)
                          ? "default"
                          : "outline"
                      }
                      className="justify-start"
                      onClick={() => handleSubjectChange(subject)}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.active.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, active: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/tutors")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : id ? "Update Tutor" : "Create Tutor"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorForm;
