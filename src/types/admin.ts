export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
}

export interface NewUser {
  email: string;
  password: string;
  username: string;
  full_name: string;
}