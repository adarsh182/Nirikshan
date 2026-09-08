import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: "700", color: Colors.text, fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Officer Login", headerShown: false }}
        />
        <Stack.Screen
          name="new-test"
          options={{
            title: "Field Test Terminal",
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="capture"
          options={{ title: "Capture & Calibrate", headerShown: false }}
        />
        <Stack.Screen
          name="result"
          options={{ title: "Examination Outcome" }}
        />
        <Stack.Screen
          name="guide"
          options={{ title: "Reference Card SOP" }}
        />
        <Stack.Screen
          name="history"
          options={{ title: "Evidence & Records Log" }}
        />
      </Stack>
    </>
  );
}
