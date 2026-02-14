import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  User,
  Wallet,
  Home,
  Compass,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button, cn } from "./ui/Shared";
import { CURRENT_USER } from "../mockData";

interface NavigationProps {
  role: "creator" | "subscriber";
  onRoleChange: (role: "creator" | "subscriber") => void;
}

export function Navigation({ role, onRoleChange }: NavigationProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const creatorLinks = [
    { label: "Dashboard", path: "/creator/dashboard", icon: LayoutDashboard },
    { label: "Create", path: "/creator/upload", icon: PlusCircle },
    { label: "Profile", path: "/creator/profile", icon: User },
    { label: "Withdraw", path: "/creator/withdraw", icon: Wallet },
  ];

  const subscriberLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Discover", path: "/discover", icon: Compass },
    { label: "My Passes", path: "/passes", icon: CreditCard },
  ];

  const links = role === "creator" ? creatorLinks : subscriberLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">
                MakePatreon
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  )}
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center">
            {/* Role Switcher for Demo */}
            <div className="mr-6 flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => onRoleChange("subscriber")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  role === "subscriber"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                Subscriber
              </button>
              <button
                onClick={() => onRoleChange("creator")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  role === "creator"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                Creator
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {CURRENT_USER.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">{role}</div>
              </div>
              <img
                className="h-8 w-8 rounded-full ring-2 ring-white"
                src={CURRENT_USER.avatar}
                alt=""
              />
            </div>
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                  isActive(link.path)
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700",
                )}
              >
                <div className="flex items-center">
                  <link.icon className="w-5 h-5 mr-3" />
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            <div className="flex items-center px-4 mb-4">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={CURRENT_USER.avatar}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {CURRENT_USER.name}
                </div>
                <div className="text-sm font-medium text-gray-500 capitalize">
                  {role}
                </div>
              </div>
            </div>
            <div className="px-4">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                Switch Role
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={role === "subscriber" ? "primary" : "outline"}
                  onClick={() => {
                    onRoleChange("subscriber");
                    setIsOpen(false);
                  }}
                  className="flex-1"
                >
                  Subscriber
                </Button>
                <Button
                  size="sm"
                  variant={role === "creator" ? "primary" : "outline"}
                  onClick={() => {
                    onRoleChange("creator");
                    setIsOpen(false);
                  }}
                  className="flex-1"
                >
                  Creator
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
