import React, { createContext, useState, ReactNode } from "react";

interface RoadmapTopic {
  topic_name?: string;
  title?: string;
  summary: string;
  sections?: any[];
}

interface RoadmapContextType {
  selectedTopic: RoadmapTopic | null;
  setSelectedTopic: (topic: RoadmapTopic | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const RoadmapContext = createContext<RoadmapContextType>({
  selectedTopic: null,
  setSelectedTopic: () => {},
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});

interface RoadmapProviderProps {
  children: ReactNode;
}

export const RoadmapProvider: React.FC<RoadmapProviderProps> = ({
  children,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopic | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSetSelectedTopic = (topic: RoadmapTopic | null) => {
    setSelectedTopic(topic);
    setIsSidebarOpen(!!topic);
  };

  return (
    <RoadmapContext.Provider
      value={{
        selectedTopic,
        setSelectedTopic: handleSetSelectedTopic,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};
