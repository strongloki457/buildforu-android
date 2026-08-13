import { PushNotifications } from "@capacitor/push-notifications";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { pushApi } from "../api/push.api";
import { isNativeApp } from "../utils/nativeMedia";

const NOTIFICATION_ROUTES = {
  chat: "/chat",
  task: "/tasks",
  material: "/materials"
};

// Registers this device for push notifications while `enabled` (i.e. the user is
// signed in) and unregisters it again on logout/unmount — native platform only.
export function usePushNotifications(enabled) {
  const navigate = useNavigate();
  const tokenRef = useRef(null);

  useEffect(() => {
    if (!isNativeApp || !enabled) return;

    let cancelled = false;
    const listenerPromises = [
      PushNotifications.addListener("registration", (token) => {
        tokenRef.current = token.value;
        pushApi.register(token.value).catch(() => {});
      }),
      PushNotifications.addListener("registrationError", (error) => {
        console.warn("Push registration failed.", error);
      }),
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const route = NOTIFICATION_ROUTES[action.notification?.data?.type];
        if (route) navigate(route);
      })
    ];

    (async () => {
      const current = await PushNotifications.checkPermissions();
      let granted = current.receive === "granted";

      if (!granted && current.receive !== "denied") {
        const requested = await PushNotifications.requestPermissions();
        granted = requested.receive === "granted";
      }

      if (granted && !cancelled) {
        await PushNotifications.register();
      }
    })();

    return () => {
      cancelled = true;
      listenerPromises.forEach((promise) => promise.then((listener) => listener.remove()));
      if (tokenRef.current) {
        void pushApi.unregister(tokenRef.current);
        tokenRef.current = null;
      }
    };
  }, [enabled, navigate]);
}
