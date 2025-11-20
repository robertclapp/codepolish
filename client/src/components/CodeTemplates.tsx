import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search, Copy } from "lucide-react";
import { toast } from "sonner";
import type { Framework } from "@shared/schemas";

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  framework: Framework;
  category: string;
  code: string;
  tags: string[];
}

const TEMPLATES: CodeTemplate[] = [
  {
    id: "react-component",
    name: "React Component",
    description: "Basic React functional component with TypeScript",
    framework: "react",
    category: "Components",
    tags: ["react", "typescript", "component"],
    code: `import React from 'react';

interface Props {
  title: string;
  children?: React.ReactNode;
}

export function MyComponent({ title, children }: Props) {
  return (
    <div className="container">
      <h1>{title}</h1>
      {children}
    </div>
  );
}`,
  },
  {
    id: "react-hook",
    name: "Custom React Hook",
    description: "Template for creating custom React hooks",
    framework: "react",
    category: "Hooks",
    tags: ["react", "hooks", "custom"],
    code: `import { useState, useEffect } from 'react';

export function useCustomHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Effect logic here
    console.log('Value changed:', value);
  }, [value]);

  return { value, setValue };
}`,
  },
  {
    id: "react-form",
    name: "Form Component",
    description: "Form with validation using React Hook Form",
    framework: "react",
    category: "Forms",
    tags: ["react", "form", "validation"],
    code: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}`,
  },
  {
    id: "vue-component",
    name: "Vue Component",
    description: "Vue 3 component with Composition API",
    framework: "vue",
    category: "Components",
    tags: ["vue", "composition-api"],
    code: `<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  title: string;
}

const props = defineProps<Props>();
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

const increment = () => {
  count.value++;
};
</script>

<template>
  <div class="container">
    <h1>{{ props.title }}</h1>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<style scoped>
.container {
  padding: 1rem;
}
</style>`,
  },
  {
    id: "svelte-component",
    name: "Svelte Component",
    description: "Svelte component with reactive state",
    framework: "svelte",
    category: "Components",
    tags: ["svelte", "reactive"],
    code: `<script lang="ts">
  export let title: string;

  let count = 0;
  $: doubleCount = count * 2;

  function increment() {
    count += 1;
  }
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Count: {count}</p>
  <p>Double: {doubleCount}</p>
  <button on:click={increment}>Increment</button>
</div>

<style>
  .container {
    padding: 1rem;
  }
</style>`,
  },
];

interface CodeTemplatesProps {
  onSelectTemplate: (code: string, name: string) => void;
  framework?: Framework;
}

export function CodeTemplates({ onSelectTemplate, framework }: CodeTemplatesProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesFramework = framework ? template.framework === framework : true;
    const matchesCategory = selectedCategory
      ? template.category === selectedCategory
      : true;

    return matchesSearch && matchesFramework && matchesCategory;
  });

  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));

  const handleUseTemplate = (template: CodeTemplate) => {
    onSelectTemplate(template.code, template.name);
    toast.success(`Template "${template.name}" loaded!`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Code Templates</DialogTitle>
          <DialogDescription>
            Quick-start templates for common patterns
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredTemplates.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No templates found
                </p>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Use
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{template.framework}</Badge>
                      <Badge variant="secondary">{template.category}</Badge>
                      {template.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-32">
                      <code>{template.code.split("\n").slice(0, 8).join("\n")}
{template.code.split("\n").length > 8 ? "..." : ""}</code>
                    </pre>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CodeTemplates;
