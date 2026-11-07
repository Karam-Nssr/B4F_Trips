import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BookingProvider } from "../context/BookingContext";

export default function RootLayout() {
  return (
    <BookingProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </BookingProvider>
  );
}
