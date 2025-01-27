import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, Edit2, Trash2, FileAudio, Image } from "lucide-react";
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
    subject: "",
    type: "",
    difficulty: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

  // ... [Previous fetchQuestions and useEffect remain the same]

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
      setError(err.response?.data?.message || "Failed to save question");
    }
  };

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

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Question Management</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* ... [Previous filters and table remain the same] */}
        </CardContent>
      </Card>

      {showForm && (
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateOrUpdate}
          onClose={() => {
            setShowForm(false);
            setEditingQuestion(null);
            resetForm();
          }}
          editingQuestion={editingQuestion}
        />
      )}
    </div>
  );
};

export default QuestionManager;
