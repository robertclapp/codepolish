import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookMarked,
  Plus,
  Search,
  Copy,
  Trash2,
  Star,
  StarOff,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import type { Framework } from "@shared/schemas";

interface Snippet {
  id: string;
  name: string;
  description: string;
  code: string;
  framework: Framework;
  tags: string[];
  favorite: boolean;
  createdAt: Date;
  usageCount: number;
}

interface SnippetLibraryProps {
  onSelectSnippet: (code: string) => void;
}

export function SnippetLibrary({ onSelectSnippet }: SnippetLibraryProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([
    {
      id: "1",
      name: "Authenticated API Hook",
      description: "Custom hook for authenticated API calls with error handling",
      code: `import { useState, useEffect } from 'react';

export function useAuthenticatedAPI<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': \`Bearer \${localStorage.getItem('token')}\`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
}`,
      framework: "react",
      tags: ["hooks", "api", "auth"],
      favorite: true,
      createdAt: new Date("2024-01-15"),
      usageCount: 12,
    },
    {
      id: "2",
      name: "Responsive Card Component",
      description: "Card component with responsive grid layout",
      code: `import React from 'react';

interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
  onClick?: () => void;
}

export function ResponsiveCard({ title, description, imageUrl, onClick }: CardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {imageUrl && (
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}`,
      framework: "react",
      tags: ["component", "ui", "responsive"],
      favorite: false,
      createdAt: new Date("2024-01-10"),
      usageCount: 8,
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    name: "",
    description: "",
    code: "",
    framework: "react" as Framework,
    tags: "",
  });

  const allTags = Array.from(
    new Set(snippets.flatMap((s) => s.tags))
  ).sort();

  const filteredSnippets = snippets
    .filter((snippet) => {
      const matchesSearch =
        snippet.name.toLowerCase().includes(search.toLowerCase()) ||
        snippet.description.toLowerCase().includes(search.toLowerCase()) ||
        snippet.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase())
        );
      const matchesTag = selectedTag ? snippet.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return b.usageCount - a.usageCount;
    });

  const handleAddSnippet = () => {
    if (!newSnippet.name || !newSnippet.code) {
      toast.error("Name and code are required");
      return;
    }

    const snippet: Snippet = {
      id: Date.now().toString(),
      name: newSnippet.name,
      description: newSnippet.description,
      code: newSnippet.code,
      framework: newSnippet.framework,
      tags: newSnippet.tags.split(",").map((t) => t.trim()).filter(Boolean),
      favorite: false,
      createdAt: new Date(),
      usageCount: 0,
    };

    setSnippets([...snippets, snippet]);
    setShowAddDialog(false);
    setNewSnippet({
      name: "",
      description: "",
      code: "",
      framework: "react",
      tags: "",
    });
    toast.success("Snippet added to library");
  };

  const handleUseSnippet = (snippet: Snippet) => {
    onSelectSnippet(snippet.code);
    setSnippets(
      snippets.map((s) =>
        s.id === snippet.id ? { ...s, usageCount: s.usageCount + 1 } : s
      )
    );
    toast.success(`Inserted "${snippet.name}"`);
  };

  const handleToggleFavorite = (id: string) => {
    setSnippets(
      snippets.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s))
    );
  };

  const handleDelete = (id: string) => {
    setSnippets(snippets.filter((s) => s.id !== id));
    toast.success("Snippet deleted");
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <BookMarked className="h-4 w-4 mr-2" />
            Snippets
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Snippet Library</DialogTitle>
                <DialogDescription>
                  Reusable code snippets and patterns
                </DialogDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Snippet
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search snippets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Tag Filters */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All ({snippets.length})
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag} ({snippets.filter((s) => s.tags.includes(tag)).length})
                </Button>
              ))}
            </div>

            {/* Snippets Grid */}
            <ScrollArea className="h-[400px]">
              {filteredSnippets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No snippets found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{snippet.name}</h4>
                            {snippet.favorite && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {snippet.description}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorite(snippet.id)}
                          >
                            {snippet.favorite ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUseSnippet(snippet)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(snippet.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{snippet.framework}</Badge>
                        {snippet.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="ml-auto text-xs">
                          Used {snippet.usageCount}x
                        </Badge>
                      </div>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-32">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Snippet Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Snippet</DialogTitle>
            <DialogDescription>
              Save a code snippet to your library
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="snippet-name">Name</Label>
              <Input
                id="snippet-name"
                value={newSnippet.name}
                onChange={(e) =>
                  setNewSnippet({ ...newSnippet, name: e.target.value })
                }
                placeholder="My Snippet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snippet-description">Description</Label>
              <Input
                id="snippet-description"
                value={newSnippet.description}
                onChange={(e) =>
                  setNewSnippet({ ...newSnippet, description: e.target.value })
                }
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snippet-code">Code</Label>
              <Textarea
                id="snippet-code"
                value={newSnippet.code}
                onChange={(e) =>
                  setNewSnippet({ ...newSnippet, code: e.target.value })
                }
                placeholder="Paste your code here..."
                className="font-mono text-sm min-h-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="snippet-tags">Tags (comma-separated)</Label>
              <Input
                id="snippet-tags"
                value={newSnippet.tags}
                onChange={(e) =>
                  setNewSnippet({ ...newSnippet, tags: e.target.value })
                }
                placeholder="hooks, api, auth"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSnippet}>Add Snippet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SnippetLibrary;
