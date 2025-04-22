import React, { useState } from "react";
import RoadmapExplorer from "../components/RoadmapExplorer";
import RoadmapSelection from "../components/RoadmapSelection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  FileUp,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileName, setFileName] = useState("");

  const handleBackToSelection = () => {
    setSelectedRoadmap(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFileName(file.name);

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadState("error");
      setUploadMessage("Only PDF files are supported");
      return;
    }

    // Start upload
    setUploadState("uploading");
    setUploadProgress(0);
    setUploadMessage("Uploading file...");

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);

      // Upload API endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload file");
      }

      // Start processing
      setUploadState("processing");
      setUploadMessage("Processing document...");

      // Poll for processing status
      const processingInterval = setInterval(async () => {
        const statusResponse = await fetch(
          `/api/status?filename=${encodeURIComponent(file.name)}`
        );
        const statusData = await statusResponse.json();

        if (statusData.status === "completed") {
          clearInterval(processingInterval);
          setUploadState("success");
          setUploadMessage(
            "Document processed successfully! Refresh the page to see your new roadmap."
          );

          // Refresh roadmap list after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } else if (statusData.status === "error") {
          clearInterval(processingInterval);
          setUploadState("error");
          setUploadMessage(statusData.message || "Failed to process document");
        }
      }, 5000); // Check every 5 seconds
    } catch (error) {
      setUploadState("error");
      setUploadMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.add("border-blue-500");
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.currentTarget.classList.remove("border-blue-500");
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove("border-blue-500");

    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Create a fake input event
    const input = document.createElement("input");
    input.files = files;
    handleFileUpload({
      target: input,
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const resetUpload = () => {
    setUploadState("idle");
    setUploadProgress(0);
    setUploadMessage("");
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {selectedRoadmap ? (
            <motion.div
              key="roadmap-explorer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <Button
                  variant="outline"
                  onClick={handleBackToSelection}
                  className="group mb-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Back to Roadmaps
                </Button>

                <div className="text-center space-y-4 mb-8">
                  <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 sm:text-5xl">
                    {selectedRoadmap.title}
                  </h1>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {selectedRoadmap.summary}
                  </p>

                  <div className="bg-purple-50 border border-purple-100 rounded-md p-3 mt-4 max-w-xl mx-auto text-sm text-purple-700">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span>Interactive Explorer</span>
                      <Badge variant="outline" className="ml-auto">
                        New
                      </Badge>
                    </div>
                    <p className="text-purple-600">
                      Click on any topic to view its summary in a sidebar
                      instead of inline.
                    </p>
                  </div>
                </div>

                <RoadmapExplorer roadmap={selectedRoadmap} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="roadmap-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8 space-y-4">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 sm:text-5xl">
                  AI Roadmap Explorer
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Navigate through interactive learning paths and explore
                  educational content
                </p>
              </div>

              <Tabs defaultValue="roadmaps" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
                  <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
                  <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>

                <TabsContent value="roadmaps" className="mt-4">
                  <RoadmapSelection onSelectRoadmap={setSelectedRoadmap} />
                </TabsContent>

                <TabsContent value="upload" className="mt-4">
                  <div className="bg-white rounded-lg shadow-sm p-6 max-w-none">
                    <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
                      Create a Roadmap from PDF
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                      Upload a PDF document to automatically generate an
                      interactive roadmap
                    </p>

                    {uploadState === "idle" ? (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() =>
                          document.getElementById("pdf-upload")?.click()
                        }
                      >
                        <FileUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                          Drag and drop your PDF here
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          or click to browse files
                        </p>
                        <Button variant="outline" className="mx-auto">
                          <Upload className="h-4 w-4 mr-2" />
                          Select PDF
                        </Button>
                        <input
                          id="pdf-upload"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </div>
                    ) : (
                      <div className="border rounded-lg p-8 bg-gray-50">
                        <div className="flex items-center mb-4">
                          {uploadState === "uploading" && (
                            <FileUp className="h-6 w-6 text-blue-500 mr-3" />
                          )}
                          {uploadState === "processing" && (
                            <span className="h-6 w-6 block rounded-full border-4 border-t-purple-600 border-purple-200 animate-spin mr-3" />
                          )}
                          {uploadState === "success" && (
                            <Check className="h-6 w-6 text-green-500 mr-3" />
                          )}
                          {uploadState === "error" && (
                            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                          )}
                          <span className="font-medium">{fileName}</span>
                        </div>

                        {uploadState === "uploading" && (
                          <div className="mb-4">
                            <Progress
                              value={uploadProgress}
                              className="h-2 mb-2"
                            />
                            <p className="text-sm text-gray-600">
                              {uploadProgress}% uploaded
                            </p>
                          </div>
                        )}

                        <p
                          className={`text-sm ${
                            uploadState === "error"
                              ? "text-red-600"
                              : uploadState === "success"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {uploadMessage}
                        </p>

                        <div className="mt-6 flex justify-center">
                          <Button
                            variant={
                              uploadState === "success" ? "default" : "outline"
                            }
                            onClick={resetUpload}
                            className={
                              uploadState === "success"
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            {uploadState === "success"
                              ? "Upload Another"
                              : "Cancel"}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        How it works
                      </h3>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>
                          Upload a PDF document (academic papers, articles,
                          books)
                        </li>
                        <li>
                          Our AI will process the document and extract the key
                          topics
                        </li>
                        <li>
                          A hierarchical roadmap structure will be automatically
                          generated
                        </li>
                        <li>
                          Access your interactive roadmap from the Roadmaps tab
                        </li>
                      </ol>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="about" className="mt-4">
                  <div className="bg-white rounded-lg shadow-sm p-6 prose max-w-none">
                    <h2>About This Tool</h2>
                    <p>
                      The AI Roadmap Explorer is an interactive tool for
                      visualizing learning paths and educational roadmaps. It
                      provides a hierarchical view of topics and subtopics,
                      making it easy to navigate complex learning materials.
                    </p>
                    <h3>Key Features</h3>
                    <ul>
                      <li>
                        <strong>Multiple Roadmaps</strong> - Browse and explore
                        various learning paths on different topics.
                      </li>
                      <li>
                        <strong>Interactive Navigation</strong> - Expand and
                        collapse sections to focus on what you're interested in.
                      </li>
                      <li>
                        <strong>Sidebar Summaries</strong> - Click on any topic
                        to view detailed summaries in a sliding sidebar.
                      </li>
                      <li>
                        <strong>Hierarchical Structure</strong> - Clear
                        organization of main topics and subtopics.
                      </li>
                      <li>
                        <strong>PDF Processing</strong> - Upload your own
                        documents to automatically generate interactive
                        roadmaps.
                      </li>
                    </ul>
                    <h3>How to Use</h3>
                    <ol>
                      <li>
                        Browse the available roadmaps and select one to explore
                      </li>
                      <li>
                        Navigate through the topics by expanding and collapsing
                        sections
                      </li>
                      <li>
                        Click on a topic title to view its detailed summary in
                        the sidebar
                      </li>
                      <li>
                        Return to the roadmap selection at any time using the
                        back button
                      </li>
                      <li>
                        Upload your own PDF documents to create custom roadmaps
                      </li>
                    </ol>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
