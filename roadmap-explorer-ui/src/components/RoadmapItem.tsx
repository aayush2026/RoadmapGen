import React, { useState, useEffect, useContext } from "react";
import { ChevronRight, ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { RoadmapContext } from "./RoadmapContext";

interface RoadmapItemProps {
  item: {
    topic_name?: string;
    title?: string;
    summary: string;
    sections: any[];
  };
  depth?: number;
  forceExpand?: boolean;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({
  item,
  depth = 0,
  forceExpand = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedTopic, setSelectedTopic } = useContext(RoadmapContext);

  const hasChildren = item.sections && item.sections.length > 0;
  const isSelected =
    selectedTopic &&
    (selectedTopic.topic_name === item.topic_name ||
      selectedTopic.title === item.title);

  useEffect(() => {
    if (forceExpand !== undefined) {
      setIsExpanded(forceExpand);
    }
  }, [forceExpand]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleShowSummary = () => {
    if (isSelected) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(item);
    }
  };

  return (
    <div className="transition-all duration-300 ease-in-out">
      <div
        className={cn(
          "group rounded-lg border transition-all duration-300 ease-in-out",
          isSelected
            ? "border-purple-400 bg-purple-50 shadow-sm"
            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
          depth > 0 && "mt-2"
        )}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="flex items-center p-3">
          {hasChildren && (
            <button
              onClick={toggleExpand}
              className="p-1 rounded-md hover:bg-purple-100 transition-colors duration-200 ease-in-out mr-2"
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-purple-600 transition-transform duration-300 ease-out" />
              ) : (
                <ChevronRight className="h-4 w-4 text-purple-600 transition-transform duration-300 ease-out" />
              )}
            </button>
          )}

          <button
            onClick={handleShowSummary}
            className={cn(
              "flex-1 text-left group/title flex items-center transition-colors duration-200 ease-in-out",
              isSelected ? "text-purple-700" : "hover:text-purple-700"
            )}
          >
            <span
              className={cn(
                "font-medium mr-2",
                isSelected && "text-purple-700"
              )}
            >
              {item.topic_name || item.title}
            </span>

            <span
              className={cn(
                "ml-auto transform transition-all duration-300 opacity-0",
                isSelected ? "opacity-100" : "group-hover/title:opacity-70"
              )}
            >
              <BookOpen className="h-4 w-4 text-purple-600" />
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "transition-all will-change-auto",
          isExpanded
            ? "max-h-[5000px] opacity-100 duration-700 ease-in-out"
            : "max-h-0 opacity-0 overflow-hidden duration-500 ease-in-out"
        )}
      >
        {hasChildren &&
          isExpanded &&
          item.sections.map((childItem, index) => (
            <RoadmapItem
              key={`${childItem.topic_name || childItem.title}-${index}`}
              item={childItem}
              depth={depth + 1}
              forceExpand={forceExpand}
            />
          ))}
      </div>
    </div>
  );
};

export default RoadmapItem;
