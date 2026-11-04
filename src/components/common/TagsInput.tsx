import React, { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function TagsInput({
  label,
  value = [],
  onChange,
  placeholder = "Type and press Enter to add tags...",
  className,
  required = false
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="min-h-[2.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeTag(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add tags. Press Backspace to remove the last tag.
      </p>
    </div>
  );
}