"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface BusinessItem {
  id: string;
  name: string;
  category: "GROCERY" | "MEDICAL" | "RESTAURANT" | "GARMENTS" | "RETAIL" | "CUSTOM";
  description?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "STORE_OWNER" | "SUPER_ADMIN";
}

interface BusinessContextType {
  businesses: BusinessItem[];
  activeBusiness: BusinessItem | null;
  setActiveBusinessId: (id: string) => void;
  isLoading: boolean;
  refreshBusinesses: () => Promise<void>;
  currentUser: CurrentUser | null;
  logout: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [activeBusinessId, setActiveBusinessIdState] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinesses = async () => {
    try {
      const res = await fetch("/api/businesses");
      if (!res.ok) {
        setBusinesses([]);
        setCurrentUser(null);
        setActiveBusinessIdState("");
        return;
      }
      const json = await res.json();
      if (json.success) {
        setBusinesses(json.businesses || []);
        if (json.currentUser) {
          setCurrentUser(json.currentUser);
        } else {
          setCurrentUser(null);
        }
        const isSuper = json.currentUser?.role === "SUPER_ADMIN" || json.currentUser?.email === "admin@gramstock.cloud";
        const stored = typeof window !== "undefined" ? localStorage.getItem("gs_active_biz_id") : null;
        if (isSuper && stored && json.businesses?.some((b: BusinessItem) => b.id === stored)) {
          setActiveBusinessIdState(stored);
        } else if (json.businesses && json.businesses.length > 0) {
          setActiveBusinessIdState(json.businesses[0].id);
        } else {
          setActiveBusinessIdState("");
        }
      }
    } catch (err) {
      console.error("Failed to load businesses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("gs_active_biz_id");
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const setActiveBusinessId = (id: string) => {
    setActiveBusinessIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("gs_active_biz_id", id);
    }
  };

  const activeBusiness =
    businesses.find((b) => b.id === activeBusinessId) || businesses[0] || null;

  // Dynamically sync data-category to root HTML element for adaptive theming
  useEffect(() => {
    if (typeof document !== "undefined") {
      const cat = (activeBusiness?.category || "RETAIL").toLowerCase();
      document.documentElement.setAttribute("data-category", cat);
    }
  }, [activeBusiness?.category]);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        setActiveBusinessId,
        isLoading,
        refreshBusinesses: fetchBusinesses,
        currentUser,
        logout,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
