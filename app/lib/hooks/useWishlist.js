"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./useToast";

export function useWishlist() {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState(new Map());
  const [initialized, setInitialized] = useState(false);

  // Initialize wishlist status from user's existing favorites
  useEffect(() => {
    const initializeWishlist = async () => {
      if (!session?.user || initialized) {
        return;
      }

      try {
        // Try with explicit parameters to avoid parsing issues
        const response = await fetch("/api/users/favorites?page=1&limit=10");

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.favorites) {
            // Create a map of property IDs that are in wishlist
            const statusMap = new Map();
            data.favorites.forEach(favorite => {
              if (favorite.propertyId && favorite.propertyId._id) {
                const propertyId = String(favorite.propertyId._id);
                statusMap.set(propertyId, true);
              }
            });
            setWishlistStatus(statusMap);
          }
        }
      } catch (err) {
        // Error initializing wishlist status - silently fail
      } finally {
        setInitialized(true);
      }
    };

    initializeWishlist();
  }, [session?.user, initialized]);

  // Add property to wishlist
  const addToWishlist = useCallback(async (propertyId, notes = "") => {
    if (!session?.user) {
      error("Please login to add properties to wishlist");
      return false;
    }

    if (loading) return false;

    try {
      setLoading(true);
      const response = await fetch("/api/users/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId, notes }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local wishlist status - ensure propertyId is stored as string
        const id = String(propertyId);
        setWishlistStatus(prev => new Map(prev).set(id, true));
        success("Property added to wishlist!");
        return true;
      } else {
        error(data.error || "Failed to add to wishlist");
        return false;
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      error("Failed to add to wishlist");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, loading, success, error]);

  // Remove property from wishlist
  const removeFromWishlist = useCallback(async (propertyId) => {
    if (!session?.user) {
      error("Please login to manage wishlist");
      return false;
    }

    if (loading) return false;

    try {
      setLoading(true);
      const response = await fetch(`/api/users/favorites?propertyId=${propertyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local wishlist status - ensure propertyId is handled as string
        const id = String(propertyId);
        setWishlistStatus(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
        success("Property removed from wishlist");
        return true;
      } else {
        error(data.error || "Failed to remove from wishlist");
        return false;
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      error("Failed to remove from wishlist");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, loading, success, error]);

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (propertyId, notes = "") => {
    const id = String(propertyId);
    const isInWishlist = wishlistStatus.get(id);

    if (isInWishlist) {
      return await removeFromWishlist(id);
    } else {
      return await addToWishlist(id, notes);
    }
  }, [wishlistStatus, addToWishlist, removeFromWishlist]);

  // Check if property is in wishlist
  const isInWishlist = useCallback((propertyId) => {
    const id = String(propertyId);
    const result = wishlistStatus.get(id) || false;
    return result;
  }, [wishlistStatus]);

  // Update wishlist status for multiple properties (useful for initializing)
  const updateWishlistStatus = useCallback((propertyIds, status = true) => {
    setWishlistStatus(prev => {
      const newMap = new Map(prev);
      propertyIds.forEach(id => {
        const propertyId = String(id);
        if (status) {
          newMap.set(propertyId, true);
        } else {
          newMap.delete(propertyId);
        }
      });
      return newMap;
    });
  }, []);

  // Clear all wishlist status (useful for logout)
  const clearWishlistStatus = useCallback(() => {
    setWishlistStatus(new Map());
  }, []);

  return {
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    updateWishlistStatus,
    clearWishlistStatus,
    loading,
    wishlistStatus,
  };
}