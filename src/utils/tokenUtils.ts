import { toast } from "sonner";

export const getTonicToken = () => {
  try {
    const tokenString = localStorage.getItem('sb-iviaxxfodvwqjiiomzkl-auth-token');
    if (!tokenString) {
      toast.error("Authentication token not found");
      return null;
    }

    const tokenData = JSON.parse(tokenString);
    if (!tokenData.access_token) {
      toast.error("Invalid token format");
      return null;
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    toast.error("Error retrieving authentication token");
    return null;
  }
};