import { useCallback, useEffect, useState } from "react";

export function useCameraDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");

  // Handler untuk update daftar perangkat
  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    setDevices(mediaDevices.filter((device) => device.kind === "videoinput"));
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDevices() {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        if (mounted) handleDevices(mediaDevices);
      } catch (err) {
        console.error("Gagal mengambil daftar kamera:", err);
      }
    }

    // Load pertama kali
    loadDevices();

    // Update otomatis jika ada perubahan perangkat (misalnya colok/cabut kamera)
    navigator.mediaDevices.addEventListener("devicechange", loadDevices);

    return () => {
      mounted = false;
      navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
    };
  }, [handleDevices]);

  // Set default device (kamera pertama) jika belum ada yang dipilih
  useEffect(() => {
    if (devices.length > 0 && !deviceId) {
      setDeviceId(devices[0].deviceId);
    }
  }, [devices, deviceId]);

  return { devices, deviceId, setDeviceId };
}
