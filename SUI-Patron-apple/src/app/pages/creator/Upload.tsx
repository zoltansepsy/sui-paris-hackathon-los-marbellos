import React from "react";
import {
  Upload,
  X,
  Clock,
  Eye,
  Lock,
  Image as ImageIcon,
  Video,
  FileText,
  Mic,
} from "lucide-react";
import { Card, Button, Badge, cn } from "../../components/ui/Shared";
import { Link } from "react-router-dom";

export function CreatorUpload() {
  const [accessType, setAccessType] = React.useState<"free" | "premium">(
    "free",
  );
  const [contentType, setContentType] = React.useState<
    "post" | "video" | "audio" | "document"
  >("post");
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create New Content</h1>
        <div className="flex space-x-3">
          <Link to="/creator/dashboard">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button variant="outline">Save Draft</Button>
          <Button>Publish</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Enter a catchy title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <div className="flex space-x-2">
                {[
                  { id: "post", label: "Post", icon: FileText },
                  { id: "video", label: "Video", icon: Video },
                  { id: "audio", label: "Audio", icon: Mic },
                  { id: "document", label: "File", icon: FileText },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setContentType(type.id as any)}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium border transition-colors",
                      contentType === type.id
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    <type.icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="border border-gray-300 rounded-md shadow-sm">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex space-x-2">
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600 font-bold">
                    B
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600 italic">
                    I
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600 underline">
                    U
                  </button>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600">
                    Link
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-600">
                    List
                  </button>
                </div>
                <textarea
                  rows={8}
                  className="block w-full p-3 border-0 focus:ring-0 sm:text-sm resize-y"
                  placeholder="Write your story here..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Media
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center transition-colors",
                dragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-gray-400",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrag}
            >
              <div className="p-4 bg-indigo-50 rounded-full mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">
                Drag and drop your files here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                MP4, JPG, PNG, MP3 supported
              </p>
              <Button variant="outline" size="sm" className="mt-6">
                Browse Files
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Access Settings
              </h3>
              <div className="space-y-3">
                <div
                  onClick={() => setAccessType("free")}
                  className={cn(
                    "flex items-start p-3 rounded-lg border cursor-pointer transition-all",
                    accessType === "free"
                      ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center",
                        accessType === "free"
                          ? "border-indigo-600"
                          : "border-gray-400",
                      )}
                    >
                      {accessType === "free" && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Public (Free)
                    </span>
                    <span className="block text-xs text-gray-500">
                      Visible to everyone
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setAccessType("premium")}
                  className={cn(
                    "flex items-start p-3 rounded-lg border cursor-pointer transition-all",
                    accessType === "premium"
                      ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center",
                        accessType === "premium"
                          ? "border-indigo-600"
                          : "border-gray-400",
                      )}
                    >
                      {accessType === "premium" && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <span className="block text-sm font-medium text-gray-900">
                        AccessPass Only
                      </span>
                      <Lock className="w-3 h-3 ml-1 text-amber-500" />
                    </div>
                    <span className="block text-xs text-gray-500">
                      Only for supporters with an active pass
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Scheduling
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Publish Time
                </span>
              </div>
              <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                <option>Publish Immediately</option>
                <option>Schedule for later...</option>
                <option>Save as Draft</option>
              </select>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Thumbnail
              </h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-xs">Click to upload thumbnail</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
