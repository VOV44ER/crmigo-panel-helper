import { LoginForm } from "@/components/auth/LoginForm";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default AuthPage;