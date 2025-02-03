import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LogOut,
  User,
  Settings,
  BarChart,
  Book,
  Clock,
  TrendingUp,
  LayoutDashboard,
  Menu,
  Bot,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import TextTranslator from "../common/TextTranslator";

const NavItem = ({ href, icon: Icon, children, isActive, onClick }) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    className={cn(
      "w-full justify-start",
      isActive && "bg-primary text-primary-foreground"
    )}
    onClick={onClick}
  >
    <Icon className="mr-2 h-4 w-4" />
    {children}
  </Button>
);

export const MainLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/landing");
  };

  const isPathActive = (path) => location.pathname === path;

  const navigationItems = [
    { href: "/subjects", icon: Book, label: "Subjects" },
    { href: "/progress", icon: TrendingUp, label: "Progress" },
    { href: "/statistics", icon: BarChart, label: "Statistics" },
    { href: "/coach", icon: Bot, label: "AI Coach" },
    ...(isAdmin
      ? [{ href: "/admin", icon: LayoutDashboard, label: "Admin" }]
      : []),
  ];

  const renderNavigation = (isMobile = false) => (
    <div className={cn("flex", isMobile ? "flex-col space-y-2" : "space-x-4")}>
      {navigationItems.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          isActive={isPathActive(item.href)}
          onClick={() => navigate(item.href)}
        >
          {item.label}
        </NavItem>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Home */}
            <div
              className="flex-shrink-0 cursor-pointer flex items-center"
              onClick={() => navigate("/")}
            >
              <Clock className="h-6 w-6 mr-2" />
              <h1 className="text-xl font-bold">Test My Russian</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {renderNavigation()}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="py-4">
                      <div className="px-4 py-2">
                        <h2 className="text-lg font-semibold">Menu</h2>
                      </div>
                      <div className="px-4 py-2">{renderNavigation(true)}</div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Test My Russian. All rights reserved.
          </p>
        </div>
      </footer>
      <TextTranslator />
    </div>
  );
};

export default MainLayout;
