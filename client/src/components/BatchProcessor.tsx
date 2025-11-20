import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Layers,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";
import type { Framework } from "@shared/schemas";

interface BatchFile {
  name: string;
  path: string;
  size: number;
  content: string;
  status: "pending" | "processing" | "completed" | "failed";
  polishedCode?: string;
  error?: string;
}

interface BatchProcessorProps {
  framework: Framework;
  onProcess?: (files: BatchFile[]) => Promise<BatchFile[]>;
}

export function BatchProcessor({ framework, onProcess }: BatchProcessorProps) {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      if (!fileList) return;

      const newFiles: BatchFile[] = [];

      for (let i = 0; i < Math.min(fileList.length, 50); i++) {
        const file = fileList[i];
        const content = await file.text();

        newFiles.push({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          size: file.size,
          content,
          status: "pending",
        });
      }

      setFiles(newFiles);
      toast.success(`Loaded ${newFiles.length} files`);
    },
    []
  );

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error("Please upload files first");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      if (onProcess) {
        const processed = await onProcess(files);
        setFiles(processed);
      } else {
        // Mock processing
        for (let i = 0; i < files.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    status: "processing" as const,
                  }
                : f
            )
          );
          setProgress(((i + 1) / files.length) * 100);

          await new Promise((resolve) => setTimeout(resolve, 500));
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    status: "completed" as const,
                    polishedCode: `// Polished version of ${f.name}\n${f.content}`,
                  }
                : f
            )
          );
        }
      }

      toast.success("Batch processing completed!");
    } catch (error) {
      toast.error("Batch processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const completedFiles = files.filter((f) => f.status === "completed");
    if (completedFiles.length === 0) {
      toast.error("No completed files to download");
      return;
    }

    // Create a downloadable ZIP-like structure
    const content = completedFiles
      .map((f) => {
        return `// File: ${f.path}\n${f.polishedCode || f.content}\n\n`;
      })
      .join("\n=".repeat(80) + "\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `polished-batch-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded polished files");
  };

  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === "pending").length,
    processing: files.filter((f) => f.status === "processing").length,
    completed: files.filter((f) => f.status === "completed").length,
    failed: files.filter((f) => f.status === "failed").length,
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Layers className="h-4 w-4 mr-2" />
          Batch Process
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Batch Processing</DialogTitle>
          <DialogDescription>
            Process multiple files at once (up to 50 files)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload */}
          {files.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload multiple files or an entire directory
              </p>
              <input
                type="file"
                multiple
                // @ts-ignore
                webkitdirectory=""
                onChange={handleFileUpload}
                className="hidden"
                id="batch-upload"
                accept=".js,.jsx,.ts,.tsx,.vue,.svelte"
              />
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <label htmlFor="batch-upload" className="cursor-pointer">
                    <FileCode className="h-4 w-4 mr-2" />
                    Choose Files
                  </label>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-2 border rounded">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-2 border rounded">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {stats.pending}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="text-center p-2 border rounded">
                  <div className="text-2xl font-bold text-blue-500">
                    {stats.processing}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Processing
                  </div>
                </div>
                <div className="text-center p-2 border rounded">
                  <div className="text-2xl font-bold text-green-500">
                    {stats.completed}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Completed
                  </div>
                </div>
                <div className="text-center p-2 border rounded">
                  <div className="text-2xl font-bold text-red-500">
                    {stats.failed}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing files...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {/* Files List */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {file.status === "pending" && (
                          <div className="h-4 w-4 rounded-full border-2" />
                        )}
                        {file.status === "processing" && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        {file.status === "completed" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {file.status === "failed" && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.path}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          file.status === "completed"
                            ? "default"
                            : file.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {file.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || stats.completed === stats.total}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4 mr-2" />
                      Process All ({stats.pending} files)
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={stats.completed === 0}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setFiles([])}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Clear
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BatchProcessor;
