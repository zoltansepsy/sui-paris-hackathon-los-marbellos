import React from "react";
import { Link } from "react-router-dom";
import { Upload, X, Check, Instagram, Twitter, Youtube } from "lucide-react";
import { Card, Button, Badge, cn } from "../../components/ui/Shared";

export function CreatorOnboarding() {
  const [activeStep, setActiveStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: "Alex Doe",
    bio: "",
    category: "",
    tags: [] as string[],
    links: [] as any[],
  });

  const [previewMode, setPreviewMode] = React.useState(false);

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Setup Form */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create your Creator Profile
          </h1>
          <p className="text-gray-500">
            Let your fans know who you are and what you create.
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  step === activeStep
                    ? "bg-indigo-600 text-white"
                    : step < activeStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500",
                )}
              >
                {step < activeStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={cn(
                    "h-1 w-12 sm:w-24 mx-2",
                    step < activeStep ? "bg-green-500" : "bg-gray-200",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-6 sm:p-8 space-y-6">
          {activeStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900">Basic Info</h3>

              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs">Change</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Bio
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      placeholder="I create..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button onClick={() => setActiveStep(2)}>Next Step</Button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900">
                Category & Tags
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Category
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option>Visual Arts</option>
                  <option>Technology</option>
                  <option>Music</option>
                  <option>Gaming</option>
                  <option>Education</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Max 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} className="flex items-center pr-1">
                      {tag}{" "}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((t) => t !== tag),
                          })
                        }
                      />
                    </Badge>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type tag and press Enter"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val && !formData.tags.includes(val)) {
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, val],
                        });
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                />
              </div>

              <div className="pt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setActiveStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setActiveStep(3)}>Next Step</Button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900">Social Links</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Instagram className="w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Instagram Username"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Twitter className="w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Twitter Handle"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Youtube className="w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="YouTube Channel URL"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-between items-center border-t border-gray-100 mt-8">
                <Button variant="ghost" onClick={() => setActiveStep(2)}>
                  Back
                </Button>
                <div className="space-x-3">
                  <Button variant="outline">Save Draft</Button>
                  <Link to="/creator/dashboard">
                    <Button>Finish Setup</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Preview Card */}
      <div className="lg:w-96 hidden lg:block sticky top-24 h-fit">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 text-center">
          Subscriber View
        </h3>
        <Card className="overflow-hidden pointer-events-none opacity-90 scale-95 transform origin-top">
          <div className="h-32 bg-gray-200"></div>
          <div className="px-6 pt-12 pb-6 relative text-center">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
              <div className="w-20 h-20 bg-gray-300 rounded-xl border-4 border-white shadow-sm flex items-center justify-center text-gray-400 text-xs">
                Avatar
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {formData.name || "Creator Name"}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              {formData.category || "Category"}
            </p>
            <p className="text-gray-600 text-sm mb-6 line-clamp-3">
              {formData.bio || "Your bio will appear here..."}
            </p>
            <Button className="w-full">Support this Creator</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
