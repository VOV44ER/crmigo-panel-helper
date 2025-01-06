import { toast } from "sonner";

export const getTonicToken = () => {
  const tokenData = localStorage.getItem('tonicToken');
  if (!tokenData) {
    toast.error("Tonic authentication token not found. Please login again.");
    return null;
  }
  try {
    const { token } = JSON.parse(tokenData);
    return token;
  } catch (error) {
    console.error('Error parsing Tonic token:', error);
    toast.error("Invalid Tonic authentication token. Please login again.");
    return null;
  }
};