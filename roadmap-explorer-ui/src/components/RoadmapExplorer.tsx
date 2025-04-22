import React, { useState, useContext } from "react";
import RoadmapItem from "./RoadmapItem";
import SidebarSummary from "./SidebarSummary";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RoadmapContext, RoadmapProvider } from "./RoadmapContext";

interface RoadmapSection {
  topic_name?: string;
  title?: string;
  summary: string;
  sections: RoadmapSection[];
}

interface RoadmapProps {
  roadmap: {
    title: string;
    summary: string;
    sections: RoadmapSection[];
    documentName?: string;
  };
}

const RoadmapContent: React.FC<RoadmapProps> = ({ roadmap }) => {
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const { selectedTopic, isSidebarOpen, setIsSidebarOpen } =
    useContext(RoadmapContext);

  const toggleAllExpand = () => {
    setIsAllExpanded(!isAllExpanded);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Card className="w-full shadow-md transition-all duration-300 ease-in-out hover:shadow-lg">
        <CardHeader className="space-y-4 pb-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-300 ease-in-out">
              {roadmap.title}
            </h2>
            <Button
              onClick={toggleAllExpand}
              variant="outline"
              className="flex items-center gap-2 transition-all duration-300 ease-in-out hover:bg-purple-50"
            >
              {isAllExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 transition-transform duration-200 ease-in-out" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 ease-in-out" />
                  Expand All
                </>
              )}
            </Button>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed transition-opacity duration-300 ease-in-out">
            {roadmap.summary}
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-2">
            {roadmap.sections.map((section, index) => (
              <RoadmapItem
                key={`${section.topic_name || section.title}-${index}`}
                item={section}
                forceExpand={isAllExpanded}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <SidebarSummary
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        topic={selectedTopic}
        documentName={roadmap.documentName}
      />
    </>
  );
};

const RoadmapExplorer: React.FC<RoadmapProps> = ({ roadmap }) => {
  return (
    <RoadmapProvider>
      <RoadmapContent roadmap={roadmap} />
    </RoadmapProvider>
  );
};

export default RoadmapExplorer;
