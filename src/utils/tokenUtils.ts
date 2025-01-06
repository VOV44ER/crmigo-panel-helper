import { toast } from "sonner";

export const getTonicToken = () => {
  const tokenData = localStorage.getItem('sb-iviaxxfodvwqjiiomzkl-auth-token');
  if (!tokenData) {
    toast.error("Authentication token not found. Please login again.");
    return null;
  }
  try {
    const { accessToken } = JSON.parse(tokenData);
    return accessToken;
  } catch (error) {
    console.error('Error parsing auth token:', error);
    toast.error("Invalid authentication token. Please login again.");
    return null;
  }
};