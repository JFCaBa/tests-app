// components/admin/TutorManager.jsx
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Edit2, UserX, UserCheck, Plus } from "lucide-react";
import axios from "axios";

const TutorManager = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTutors();
  }, [page, search]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/tutors", {
        params: { page, search, limit: 10 },
      });
      setTutors(response.data.tutors);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch tutors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (tutor) => {
    try {
      await axios.put(`/admin/tutors/${tutor._id}`, {
        active: !tutor.active,
      });
      fetchTutors();
    } catch (error) {
      console.error("Failed to update tutor status:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Manage Tutors</CardTitle>
            <Button onClick={() => navigate("/admin/tutors/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tutor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tutors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : tutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No tutors found
                    </TableCell>
                  </TableRow>
                ) : (
                  tutors.map((tutor) => (
                    <TableRow key={tutor._id}>
                      <TableCell>{tutor.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects.map((subject) => (
                            <Badge key={subject} variant="secondary">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>${tutor.hourlyRate}/hr</TableCell>
                      <TableCell>
                        <Badge
                          variant={tutor.active ? "success" : "destructive"}
                        >
                          {tutor.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/tutors/${tutor._id}/edit`)
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusToggle(tutor)}
                          >
                            {tutor.active ? (
                              <UserX className="h-4 w-4 text-red-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorManager;
