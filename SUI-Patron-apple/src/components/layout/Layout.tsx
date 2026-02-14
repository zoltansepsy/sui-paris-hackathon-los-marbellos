import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  LayoutDashboard,
  Rss,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { Button, Avatar } from "../ui/Shared";
import { cn } from "../../lib/utils";
import { MOCK_USER } from "../../data/mockData";

interface LayoutProps {
  children: React.ReactNode;
}

// Simple auth context simulation
export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  user: typeof MOCK_USER | null;
  login: () => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const Layout = ({ children }: LayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const login = () => {
    setIsAuthenticated(true);
    // In a real app, this would be handled by the callback
    // For demo, we just flip the state
  };

  const logout = () => {
    setIsAuthenticated(false);
    navigate("/");
  };

  const navItems = [
    { label: "Explore", path: "/explore", icon: Compass },
    ...(isAuthenticated
      ? [
          { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { label: "Feed", path: "/feed", icon: Rss },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: isAuthenticated ? MOCK_USER : null,
        login,
        logout,
      }}
    >
      <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-[var(--brand-primary)] selection:text-white">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-[var(--border-default)] bg-[var(--bg-overlay)] backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link
                to={isAuthenticated ? "/explore" : "/"}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white font-bold text-xl">
                  S
                </div>
                <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] hidden sm:block">
                  SuiPatron
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--text-primary)]",
                      isActive(item.path)
                        ? "text-[var(--brand-primary)]"
                        : "text-[var(--text-secondary)]",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {MOCK_USER.suins || "0x..."}
                    </div>
                  </div>

                  {/* Avatar Dropdown (simplified as a hover group for MVP) */}
                  <div className="group relative">
                    <button className="flex items-center gap-2 rounded-full focus:outline-none">
                      <Avatar fallback="D" size="sm" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-[var(--border-default)] bg-[var(--bg-overlay)] p-1 shadow-[var(--shadow-lg)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="px-3 py-2 border-b border-[var(--border-default)] mb-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {MOCK_USER.suins}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {MOCK_USER.address}
                        </p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button onClick={login} size="sm">
                  Sign in with Google
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Mobile Nav (Bottom Bar) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-raised)] pb-safe">
          <div className="grid grid-cols-4 h-16">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  isActive(item.path)
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--text-secondary)]",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/settings"
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  isActive("/settings")
                    ? "text-[var(--brand-primary)]"
                    : "text-[var(--text-secondary)]",
                )}
              >
                <UserIcon className="h-5 w-5" />
                <span className="text-[10px] font-medium">Profile</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </AuthContext.Provider>
  );
};
