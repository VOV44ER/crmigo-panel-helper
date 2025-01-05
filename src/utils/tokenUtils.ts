import { toast } from "sonner";

export const getTonicToken = () => {
  const tokenData = localStorage.getItem('sb-iviaxxfodvwqjiiomzkl-auth-token');
  if (!tokenData) {
    toast.error("Authentication token not found. Please login again.");
    return null;
  }
  try {
    const { access_token } = JSON.parse(tokenData);
    return access_token;
  } catch (error) {
    console.error('Error parsing auth token:', error);
    toast.error("Invalid authentication token. Please login again.");
    return null;
  }
};