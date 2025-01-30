import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileAudio,
  Image,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QuestionForm from "./QuestionForm";
import { BulkQuestionUpload } from "./BulkQuestionUpload";

const subjects = [
  "listening",
  "grammar",
  "history",
  "laws",
  "reading",
  "writing",
];
const questionTypes = ["multiple-choice", "writing", "audio"];
const difficultyLevels = ["easy", "medium", "hard"];

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    subject: "all",
    type: "all",
    difficulty: "all",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    type: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "",
    sampleResponse: "",
    audioFile: null,
    imageFile: null,
  });

  const resetForm = () => {
    setFormData({
      subject: "",
      type: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      difficulty: "medium",
      explanation: "",
      sampleResponse: "",
      audioFile: null,
      imageFile: null,
    });
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      // Clean up filters before sending
      const cleanFilters = {
        ...filters,
        subject: filters.subject === "all" ? undefined : filters.subject,
        type: filters.type === "all" ? undefined : filters.type,
        difficulty:
          filters.difficulty === "all" ? undefined : filters.difficulty,
        search: filters.search?.trim() || undefined,
        page,
      };

      // Remove undefined values
      const queryParams = Object.fromEntries(
        Object.entries(cleanFilters).filter(([_, value]) => value !== undefined)
      );

      const response = await axios.get("/questions", {
        params: queryParams,
      });

      setQuestions(response.data.questions);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filters, page]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = (value) => {
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set loading state immediately
    setLoading(true);

    // Set a new timeout to update search after typing stops
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPage(1); // Reset to first page when searching
    }, 300); // Reduced to 300ms for better responsiveness

    setSearchTimeout(timeout);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "options") {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else if (key === "audioFile" && formData[key]) {
          formDataObj.append("audio", formData[key]);
        } else if (key === "imageFile" && formData[key]) {
          formDataObj.append("image", formData[key]);
        } else {
          formDataObj.append(key, formData[key]);
        }
      });

      if (editingQuestion) {
        await axios.put(`/api/questions/${editingQuestion._id}`, formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/questions", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowForm(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save question");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(`/api/questions/${id}`);
        fetchQuestions();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete question");
      }
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      subject: question.subject,
      type: question.type,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      explanation: question.explanation || "",
      sampleResponse: question.sampleResponse || "",
      audioFile: null,
      imageFile: null,
    });
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingQuestion(null);
    resetForm();
  };

  const handleBulkUploadComplete = () => {
    setShowBulkUpload(false);
    fetchQuestions();
  };

  if (showBulkUpload) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Bulk Upload Questions</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowBulkUpload(false)}
              >
                Back to Questions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BulkQuestionUpload onUploadComplete={handleBulkUploadComplete} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Question Management</CardTitle>
            <div className="flex gap-4">
              <Button onClick={() => setShowBulkUpload(true)} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-4">
              <div className="w-full md:w-auto">
                <Select
                  value={filters.subject}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      subject: value,
                    })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto">
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      type: value,
                    })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Question Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {questionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto">
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      difficulty: value,
                    })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-auto flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search questions..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Media</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No questions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((question) => (
                      <TableRow key={question._id}>
                        <TableCell className="max-w-md truncate">
                          {question.question}
                        </TableCell>
                        <TableCell>{question.subject}</TableCell>
                        <TableCell>{question.type}</TableCell>
                        <TableCell>{question.difficulty}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {question.audioUrl && (
                              <FileAudio className="h-4 w-4 text-blue-500" />
                            )}
                            {question.imageUrl && (
                              <Image className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(question)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(question._id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateOrUpdate}
          onClose={handleFormClose}
          editingQuestion={editingQuestion}
        />
      )}
    </div>
  );
};

export default QuestionManager;
