"use client";
import { useUser } from "@clerk/nextjs";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRouter } from "next/router";
import { useCallback, useRef, useState } from "react";

function PDFDropzone() {
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadFiles] = useState<string[]>([]); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);


  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useUser();
  
  
  // Set up sensors for drag detection
  const sensors = useSensors(useSensor(PointerSensor));



  // Handle file drop via native browser events for better PDF support 

  const handleDrageOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    console.log("Dropped");
  }, [])

  const canUpload = true;

  return (
    <DndContext sensors={sensors} >
      <div className="w-full max-w-md mx-auto bg-red-400 ">
        <div 
          onDragOver={canUpload ? handleDrageOver : undefined}
          onDragLeave={canUpload ? handleDragLeave : undefined}
          onDrop={canUpload ? handleDrop : (e) => e.preventDefault()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}
            ${!canUpload ? "opacity-70 cursor-not-allowed" : ""}
            `}
        >
        </div>
      </div>
    </DndContext>
  )
}

export default PDFDropzone;
