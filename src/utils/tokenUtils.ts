import { toast } from "sonner";

export const getTonicToken = () => {
  const tokenData = localStorage.getItem('sb-iviaxxfodvI'll help you update the code to correctly use the Supabase auth token from local storage. Looking at the error and the code, we need to update how we handle the token retrieval.

<lov-code>
Let's update the token utility file to correctly access the Supabase auth token:

<lov-write file_path="src/utils/tokenUtils.ts">
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