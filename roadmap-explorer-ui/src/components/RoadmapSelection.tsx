import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { FileText, ArrowRight, FolderOpen, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

interface RoadmapFile {
  id: string;
  name: string;
  title: string;
  summary: string;
  path: string;
  sectionCount: number;
}

interface RoadmapSelectionProps {
  onSelectRoadmap: (roadmap: any) => void;
}

const RoadmapSelection: React.FC<RoadmapSelectionProps> = ({
  onSelectRoadmap,
}) => {
  const [roadmaps, setRoadmaps] = useState<RoadmapFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);

        // Fetch the manifest file that contains a list of all roadmap files
        const manifestResponse = await fetch("/roadmap/manifest.json");
        if (!manifestResponse.ok) {
          throw new Error("Failed to fetch roadmap manifest");
        }

        const manifest = await manifestResponse.json();
        const roadmapFiles = manifest.roadmaps || [];

        // Fetch and parse each file from the manifest
        const roadmapData = await Promise.all(
          roadmapFiles.map(async (file) => {
            try {
              const response = await fetch(file.path);

              if (!response.ok) {
                console.error(
                  `Failed to load ${file.name}: ${response.status}`
                );
                return null;
              }

              const data = await response.json();
              return {
                id: file.name.replace(".json", ""),
                name: file.name,
                title:
                  data.title ||
                  file.name.replace(".json", "").replace(/-/g, " "),
                summary: data.summary || "No summary available",
                path: file.path,
                sectionCount: data.sections?.length || 0,
              };
            } catch (error) {
              console.error(`Error loading ${file.name}:`, error);
              return null;
            }
          })
        );

        // Filter out any failed loads
        setRoadmaps(roadmapData.filter(Boolean) as RoadmapFile[]);
        setLoading(false);
      } catch (error) {
        console.error("Error loading roadmaps:", error);
        setError("Failed to load roadmaps. Please try again later.");
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  const handleSelectRoadmap = async (roadmap: RoadmapFile) => {
    try {
      const response = await fetch(roadmap.path);
      if (!response.ok) {
        throw new Error(`Failed to load roadmap: ${response.status}`);
      }

      const data = await response.json();

      // Add the document name to the roadmap data for vector search
      const documentName = roadmap.id || roadmap.name.replace(".json", "");
      onSelectRoadmap({
        ...data,
        documentName,
      });
    } catch (error) {
      console.error("Error loading roadmap:", error);
      setError("Failed to load the selected roadmap.");
    }
  };

  if (error) {
    return (
      <Card className="w-full bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          Loading Roadmaps...
        </h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Available Roadmaps
      </h2>

      {roadmaps.length === 0 ? (
        <Card className="w-full bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-yellow-700 text-center">No roadmaps found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {roadmaps.map((roadmap, index) => (
            <motion.div
              key={roadmap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold mb-1 text-purple-700">
                        {roadmap.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        <span>{roadmap.name}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-purple-50">
                      <Tag className="h-3 w-3 mr-1" />
                      <span>{roadmap.sectionCount} sections</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 line-clamp-3">
                    {roadmap.summary}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button
                    onClick={() => handleSelectRoadmap(roadmap)}
                    className="w-full bg-purple-600 hover:bg-purple-700 group"
                  >
                    <span className="mr-2">Explore Roadmap</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapSelection;
