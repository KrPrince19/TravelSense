"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

interface LocationDetails {
  city: string;
  state: string;
  country: string;
}

interface LocationState {
  coordinates: Coordinates;
  locationDetails: LocationDetails | null;
  error: string | null;
  loading: boolean;
}

interface LocationContextType extends LocationState {
  searchLocation: (query: string) => Promise<void>;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationState>({
    coordinates: { latitude: null, longitude: null },
    locationDetails: null,
    error: null,
    loading: true,
  });

  const getPosition = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, error: "Geolocation is not supported by your browser.", loading: false }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`/api/location?lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
          }
          const data = await response.json();
          setLocation({
            coordinates: { latitude, longitude },
            locationDetails: { city: data.city, state: data.state, country: data.country },
            error: null,
            loading: false,
          });
        } catch (fetchError: any) {
          console.error("[useLocation] Fetch Error:", fetchError);
          setLocation({
            coordinates: { latitude, longitude },
            locationDetails: null,
            error: `Failed to detect location: ${fetchError.message}`,
            loading: false,
          });
        }
      },
      (geoError) => {
        console.error("[useLocation] Geolocation Error:", geoError);
        setLocation({
          coordinates: { latitude: null, longitude: null },
          locationDetails: null,
          error: geoError.message,
          loading: false,
        });
      }
    );
  };

  // Default GPS Fetch on Mount
  useEffect(() => {
    getPosition();
  }, []);

  const refreshLocation = () => {
    getPosition();
  };

  // New Global Forward Search Method!
  const searchLocation = async (query: string) => {
    setLocation((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/search-location?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to contact search service.");
      const data = await res.json();
      if (!data || data.length === 0) throw new Error(`Could not find location "${query}". Try adding the country name.`);

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      // Now reverse-geocode to get standardized city/state/country via our backend
      const backendRes = await fetch(`/api/location?lat=${lat}&lon=${lon}`);
      if (!backendRes.ok) {
         const errData = await backendRes.json().catch(() => ({}));
         throw new Error(errData.error || "Failed to standardize location details.");
      }
      const locData = await backendRes.json();

      setLocation({
        coordinates: { latitude: lat, longitude: lon },
        locationDetails: { city: locData.city || query, state: locData.state || "", country: locData.country || "" },
        error: null,
        loading: false,
      });
    } catch (e: any) {
      console.error("[useLocation] Search Error:", e);
      setLocation((prev) => ({ ...prev, error: e.message, loading: false }));
    }
  };

  const { user, isLoaded: userLoaded } = useUser();

  // Sync Location to Backend when user is logged in
  useEffect(() => {
    const syncLocation = async () => {
      if (!userLoaded || !user || !location.coordinates.latitude || !location.coordinates.longitude) return;

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";
        await fetch(`${backendUrl}/api/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude,
          }),
        });
        console.log("Location synced to backend successfully.");
      } catch (error) {
        console.error("Failed to sync location to backend:", error);
      }
    };

    syncLocation();
  }, [user, userLoaded, location.coordinates.latitude, location.coordinates.longitude]);

  return (
    <LocationContext.Provider value={{ ...location, searchLocation, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
