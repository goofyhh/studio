import { LoginScreen } from "@/components/auth/LoginScreen";
import { AppProvider } from "@/contexts/AppContext"; // Import AppProvider

export default function LoginPage() {
  return (
    // Wrap LoginScreen with AppProvider so LoginForm can use useAppContext
    <AppProvider>
      <LoginScreen />
    </AppProvider>
  );
}
