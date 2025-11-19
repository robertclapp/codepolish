import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE, getLoginUrl, PRICING_TIERS } from "@/const";
import { ArrowRight, Check, Code2, Sparkles, Zap, Shield, FileCode, GitBranch } from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{APP_TITLE}</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </a>
            <ThemeToggle />
            {isAuthenticated ? (
              <Button onClick={() => setLocation("/dashboard")}>Dashboard</Button>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-1.5">
            <Sparkles className="mr-2 h-3 w-3" />
            Transform AI-Generated Code in 60 Seconds
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Turn <span className="text-primary">Messy AI Code</span>
            <br />
            Into Production-Ready Magic
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop wasting hours refactoring AI-generated code from MagicPath, v0, and Lovable. 
            CodePolish automatically transforms it into clean, documented, production-ready code.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
              Start Polishing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
              See Demo
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-8">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>5 free polishes/month</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>60 second results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container py-16 bg-muted/50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">The Problem with AI-Generated Code</h2>
            <p className="text-lg text-muted-foreground">
              AI design tools are amazing for speed, but the code quality is consistently poor
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Before CodePolish</CardTitle>
                <CardDescription>Typical AI-generated code issues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-destructive">✗</span>
                  <span>Inline styles and hardcoded values</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-destructive">✗</span>
                  <span>No documentation or comments</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-destructive">✗</span>
                  <span>Missing accessibility features</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-destructive">✗</span>
                  <span>Poor component structure</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-destructive">✗</span>
                  <span>No error handling</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-destructive">✗</span>
                  <span>Security vulnerabilities</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/50">
              <CardHeader>
                <CardTitle className="text-green-500">After CodePolish</CardTitle>
                <CardDescription>Production-ready code in 60 seconds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Design tokens and CSS variables</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Comprehensive JSDoc comments</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>ARIA labels and semantic HTML</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Modular, reusable components</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Proper error boundaries</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Security best practices</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to transform AI code into production-ready quality
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get polished code in 60 seconds. What takes hours manually happens instantly with AI-powered refactoring.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Security Hardened</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically identifies and fixes XSS vulnerabilities, sanitizes inputs, and implements security best practices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileCode className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Test Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generates comprehensive unit tests, integration tests, and accessibility tests for all components.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <GitBranch className="h-10 w-10 text-primary mb-2" />
                <CardTitle>GitHub Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Push polished code directly to your GitHub repository with proper folder structure and documentation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multi-Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Supports React, Vue, and Svelte with framework-specific optimizations and best practices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Quality Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See your code quality score before and after, with detailed breakdown of improvements made.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="container py-16 bg-muted/50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Watch how CodePolish transforms messy AI code into production-ready quality
          </p>
          <div className="aspect-video bg-background rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">Demo video coming soon</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {Object.entries(PRICING_TIERS).map(([key, tier]) => (
              <Card key={key} className={key === 'pro' ? 'border-primary shadow-lg' : ''}>
                <CardHeader>
                  {key === 'pro' && (
                    <Badge className="w-fit mb-2">Most Popular</Badge>
                  )}
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>
                    {tier.price === null ? (
                      <span className="text-3xl font-bold">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${tier.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={key === 'pro' ? 'default' : 'outline'}
                    onClick={handleGetStarted}
                  >
                    {tier.price === null ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-4xl text-center space-y-8 bg-primary/5 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Ship Production-Ready Code?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join developers who are saving hours of refactoring time with CodePolish
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
            Start Polishing Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-5 w-5 text-primary" />
                <span className="font-bold">{APP_TITLE}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform AI-generated code into production-ready quality in 60 seconds.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-primary transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 {APP_TITLE}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
