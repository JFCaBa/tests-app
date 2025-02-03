import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS } from "./constants";

const SubjectSelector = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select subject" />
      </SelectTrigger>
      <SelectContent>
        {SUBJECTS.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            <span className="flex items-center gap-2">
              {subject.icon} {subject.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SubjectSelector;
