// components/admin/AddTutor.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import axios from "axios";

const subjects = [
  "listening",
  "grammar",
  "history",
  "laws",
  "reading",
  "writing",
  "exam",
];

const AddTutor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    bio: "",
    hourlyRate: "",
    subjects: [],
    phonePayments: false,
    paypalPayments: false,
    phoneNumber: "",
    paypalEmail: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/admin/tutors", formData);
      navigate("/admin/tutors");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to create tutor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Subjects</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!formData.subjects.includes(value)) {
                      setFormData({
                        ...formData,
                        subjects: [...formData.subjects, value],
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects
                      .filter((subject) => !formData.subjects.includes(subject))
                      .map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.subjects.map((subject) => (
                    <Button
                      key={subject}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          subjects: formData.subjects.filter(
                            (s) => s !== subject
                          ),
                        })
                      }
                    >
                      {subject}
                      <span className="ml-2">×</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phonePayments">Accept Phone Payments</Label>
                  <Switch
                    id="phonePayments"
                    checked={formData.phonePayments}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, phonePayments: checked })
                    }
                  />
                </div>
                {formData.phonePayments && (
                  <Input
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="paypalPayments">Accept PayPal</Label>
                  <Switch
                    id="paypalPayments"
                    checked={formData.paypalPayments}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, paypalPayments: checked })
                    }
                  />
                </div>
                {formData.paypalPayments && (
                  <Input
                    type="email"
                    placeholder="PayPal Email"
                    value={formData.paypalEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, paypalEmail: e.target.value })
                    }
                  />
                )}
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
                {loading ? "Creating..." : "Create Tutor"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTutor;
