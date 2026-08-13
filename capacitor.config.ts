import type { CapacitorConfig } from "@capacitor/cli";

// CAP_ENV=dev points the native shell at the live Vite dev server (10.0.2.2 = emulator's
// alias for the host machine) so code changes hot-reload without rebuilding the APK.
// Any other value (including unset, i.e. a real release build) loads the bundled dist/
// assets instead — required for the app to work outside the emulator.
const isDev = process.env.CAP_ENV === "dev";

const config: CapacitorConfig = {
  appId: "com.buildforu.app",
  appName: "BuildForU",
  webDir: "dist",
  ...(isDev
    ? {
        server: {
          url: "http://10.0.2.2:5173",
          cleartext: true
        }
      }
    : {}),
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Geolocation: {
      permissions: ["location"]
    }
  }
};

export default config;
