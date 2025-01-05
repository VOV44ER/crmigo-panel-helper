export interface User {
  id: string;
  username: string;
  full_name: string;
}

export interface NewUser {
  username: string;
  password: string;
  full_name: string;
}