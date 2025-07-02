import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Settings, Home as HomeIcon } from "lucide-react";
import Home from "@/pages/home";
import DeviceAdmin from "@/pages/device-admin";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold text-gray-900">Sense360 Flash</h1>
          <div className="flex space-x-4">
            <Link href="/">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Flash Tool</span>
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant={location === "/admin" ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Device Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={DeviceAdmin} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
