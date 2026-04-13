const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 0
};

function getLocationErrorKey(error) {
  if (error?.code === 1) {
    return "attendance.locationDenied";
  }

  return "attendance.locationUnavailable";
}

export function requestCurrentLocation() {
  if (!("geolocation" in navigator)) {
    return Promise.resolve({
      location: null,
      messageKey: "attendance.locationUnavailable"
    });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          location: {
            latitude: Number(position.coords.latitude.toFixed(5)),
            longitude: Number(position.coords.longitude.toFixed(5))
          },
          messageKey: null
        });
      },
      (error) => {
        resolve({
          location: null,
          messageKey: getLocationErrorKey(error)
        });
      },
      GEOLOCATION_OPTIONS
    );
  });
}
