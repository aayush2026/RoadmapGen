import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// For rendering markdown with math support
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

interface DetailedViewProps {}

const DetailedView: React.FC<DetailedViewProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedContent, setDetailedContent] = useState<{
    topic: string;
    detailed_content: string;
    score?: number;
    source_chunk?: string;
  } | null>(null);

  useEffect(() => {
    const fetchDetailedContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Extract query parameters
        const searchParams = new URLSearchParams(location.search);
        const topic = searchParams.get("topic");
        const summary = searchParams.get("summary");
        const document = searchParams.get("document");

        if (!topic || !document) {
          throw new Error("Missing required parameters: topic or document");
        }

        console.log("Making API request with:", { topic, summary, document });

        // Call the API with the full URL path
        const apiUrl = "/api/detail";
        console.log("Using API URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            summary,
            document_name: document,
          }),
        });

        // Log the full response for debugging
        console.log(
          "API Response status:",
          response.status,
          response.statusText
        );

        // If response is not JSON, get the text to see what's being returned
        if (
          !response.headers.get("content-type")?.includes("application/json")
        ) {
          const text = await response.text();
          console.error(
            "Received non-JSON response:",
            text.substring(0, 500) + "..."
          );
          throw new Error(
            `Server returned non-JSON response (${
              response.status
            }): ${text.substring(0, 100)}...`
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch detailed content"
          );
        }

        const data = await response.json();
        setDetailedContent(data);
      } catch (err: any) {
        console.error("Error fetching detailed content:", err);
        setError(err.message || "Failed to load detailed content");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedContent();
  }, [location]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2 mb-4 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Roadmap
        </Button>

        {loading ? (
          <Card className="border-purple-100 shadow-md">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative h-10 w-10 flex-shrink-0">
                  <div className="absolute animate-ping h-10 w-10 rounded-full bg-purple-200 opacity-60"></div>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  </div>
                </div>
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="pt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="pt-2">
                <p className="text-sm text-purple-600 animate-pulse">
                  Searching for relevant content and generating detailed
                  explanation...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium text-red-700 mb-2">
                Error Loading Content
              </h2>
              <p className="text-red-600">{error}</p>
              <Button className="mt-4" variant="outline" onClick={handleGoBack}>
                Return to Roadmap
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {detailedContent?.topic}
              </CardTitle>
              <p className="text-gray-500 mt-1">Detailed Learning Material</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="text-gray-700 leading-relaxed" {...props} />
                    ),
                  }}
                >
                  {detailedContent?.detailed_content || ""}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DetailedView;
