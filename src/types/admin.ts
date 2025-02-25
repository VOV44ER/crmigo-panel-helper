export interface User {
  id: string;
  username: string;
  full_name: string;
  password_text?: string;
  platforms?: string[];
}

export interface NewUser {
  username: string;
  password: string;
  full_name: string;
  platforms: string[];
}