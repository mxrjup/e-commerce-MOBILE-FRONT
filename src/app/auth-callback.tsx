import { Redirect } from 'expo-router';

// The root AuthProvider completes the browser popup before returning to login.
export default function AuthCallback() {
  return <Redirect href="/" />;
}
