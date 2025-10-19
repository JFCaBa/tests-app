import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
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
  GraduationCap,
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
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import TextTranslator from "../common/TextTranslator";

export const MainLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isPathActive = (path) => location.pathname === path;

  const navigationItems = [
    { href: "/subjects", icon: Book, label: t("nav.subjects") },
    { href: "/progress", icon: TrendingUp, label: t("nav.progress") },
    { href: "/statistics", icon: BarChart, label: t("nav.statistics") },
    { href: "/flashcards", icon: Clock, label: t("nav.flashcards") },
    { href: "/coach", icon: Bot, label: t("nav.aiCoach") },
    ...(isAdmin
      ? [
          { href: "/tuition", icon: GraduationCap, label: t("nav.tuition") },
          { href: "/admin", icon: LayoutDashboard, label: t("nav.admin") },
        ]
      : []),
  ];

  const renderNavigation = (isMobile = false) => (
    <div className={cn("flex", isMobile ? "flex-col space-y-2" : "space-x-4")}>
      {navigationItems.map((item) => (
        <Button
          key={item.href}
          variant={isPathActive(item.href) ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            isPathActive(item.href) && "bg-primary text-primary-foreground"
          )}
          onClick={() => navigate(item.href)}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Home - Only visible on mobile */}
            <div
              className="md:hidden flex-shrink-0 cursor-pointer flex items-center"
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
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

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
                        {user?.isTemporary ? "Guest" : user?.username}
                      </p>
                      {!user?.isTemporary && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.isTemporary ? (
                    <DropdownMenuItem onClick={() => navigate("/register")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Sign Up</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      {t("menu.profile")}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("menu.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("menu.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
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
                        <h2 className="text-lg font-semibold">
                          {t("menu.menu")}
                        </h2>
                      </div>
                      <div className="px-4 pb-4 border-b">
                        <LanguageSwitcher />
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
      <footer className="bg-white border-t mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Network Links Section */}
          <div className="mb-6 border-b pb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Our Projects</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="https://testmydele.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  TestMyDELE
                </a>
                {" "}&mdash; Prepare for Spanish DELE certification.
              </li>
              <li>
                <a href="https://localguideapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  LocalGuideApp
                </a>
                {" "}&mdash; Discover cities with AI-powered tours.
              </li>
              <li>
                <a href="https://mt4-vps.com" target="_blank" rel="nofollow noopener noreferrer" className="hover:text-primary transition-colors">
                  MT4-VPS
                </a>
                {" "}&mdash; Secure VPS hosting for traders.
              </li>
            </ul>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Test My Russian. {t("footer.rights")}
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button
                onClick={() => navigate("/contact")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {t("footer.contact")}
              </button>
              <button
                onClick={() => navigate("/privacy")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {t("footer.privacy")}
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {t("footer.terms")}
              </button>
            </div>
          </div>
        </div>
      </footer>
      <TextTranslator />
    </div>
  );
};

export default MainLayout;

MainLayout.propTypes = {};




