import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, User, Settings, BarChart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const MainLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Home */}
            <div
              className="flex-shrink-0 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <h1 className="text-xl font-bold">Test App</h1>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate("/subjects")}>
                  Subjects
                </Button>
                <Button variant="ghost" onClick={() => navigate("/practice")}>
                  Practice
                </Button>
                <Button variant="ghost" onClick={() => navigate("/progress")}>
                  Progress
                </Button>
                {isAdmin && (
                  <Button variant="ghost" onClick={() => navigate("/admin")}>
                    Admin
                  </Button>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-700" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border border-gray-200 shadow-md"
                >
                  <DropdownMenuLabel className="font-bold text-gray-900">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/statistics")}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Statistics
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer hover:bg-gray-100 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Button
            variant="ghost"
            className="w-full text-left"
            onClick={() => navigate("/subjects")}
          >
            Subjects
          </Button>
          <Button
            variant="ghost"
            className="w-full text-left"
            onClick={() => navigate("/practice")}
          >
            Practice
          </Button>
          <Button
            variant="ghost"
            className="w-full text-left"
            onClick={() => navigate("/progress")}
          >
            Progress
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              className="w-full text-left"
              onClick={() => navigate("/admin")}
            >
              Admin
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Test App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
