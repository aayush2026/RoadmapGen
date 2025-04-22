import React, { useEffect } from "react";
import { X, BookOpen, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "./ui/badge";

interface SidebarSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  topic: {
    title?: string;
    topic_name?: string;
    summary: string;
  } | null;
  documentName?: string;
}

const SidebarSummary: React.FC<SidebarSummaryProps> = ({
  isOpen,
  onClose,
  topic,
  documentName,
}) => {
  const navigate = useNavigate();

  // Handle ESC key press to close the sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLearnInDetail = () => {
    if (!topic) return;

    // Navigate to the detailed view with query parameters
    const params = new URLSearchParams({
      topic: topic.topic_name || topic.title || "",
      summary: topic.summary || "",
      document: documentName || "",
    });

    navigate(`/detail?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && topic && (
        <>
          {/* Overlay with click-away functionality */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-0 right-0 z-50 h-full w-full max-w-md",
              "bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col"
            )}
          >
            <Card className="h-full border-0 rounded-none flex flex-col">
              <CardHeader className="border-b pb-4 relative">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start"
                >
                  <div className="mr-3 mt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                      <BookOpen className="h-4 w-4 text-purple-700" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-purple-700 pr-8 flex items-center gap-2">
                      {topic.topic_name || topic.title}
                    </CardTitle>
                    <CardDescription className="text-gray-500 mt-1 flex items-center gap-1">
                      <span>Topic Summary</span>
                      <ChevronRight className="h-3 w-3" />
                      <Badge
                        variant="outline"
                        className="text-xs font-normal rounded-sm"
                      >
                        Learn
                      </Badge>
                    </CardDescription>
                  </div>
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute right-4 top-4 hover:bg-purple-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </CardHeader>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-grow overflow-auto"
              >
                <CardContent className="pt-6">
                  <div className="prose prose-purple max-w-none">
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-700 leading-relaxed"
                    >
                      {topic.summary}
                    </motion.p>

                    {documentName && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 pt-4 border-t border-gray-100"
                      >
                        <Button
                          variant="outline"
                          onClick={handleLearnInDetail}
                          className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Learn in Detail
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </motion.div>

              <CardFooter className="border-t py-3 flex justify-end">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Close
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarSummary;
