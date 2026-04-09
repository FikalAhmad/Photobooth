import { useCallback, useEffect, useState } from "react";

export const useCameraDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");

  // Handler untuk update daftar perangkat
  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const videoDevices = mediaDevices.filter(
      (device) => device.kind === "videoinput",
    );

    // Hindari duplikat deviceId (terutama yang string kosong) yang bisa bikin react crash jika jadi key
    const uniqueDevices = videoDevices.reduce((acc, current) => {
      const isDuplicate = acc.find(
        (item) => item.deviceId === current.deviceId,
      );
      // Simpan hanya satu yang deviceId-nya kosong
      if (current.deviceId === "") {
        if (!acc.some((d) => d.deviceId === "")) {
          acc.push(current);
        }
      } else if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, [] as MediaDeviceInfo[]);

    setDevices(uniqueDevices);
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      handleDevices(mediaDevices);
    } catch (err) {
      console.error("Gagal mengambil daftar kamera:", err);
    }
  }, [handleDevices]);

  useEffect(() => {
    // Load pertama kali
    refreshDevices();

    // Update otomatis jika ada perubahan perangkat (misalnya colok/cabut kamera)
    navigator.mediaDevices.addEventListener("devicechange", refreshDevices);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        refreshDevices,
      );
    };
  }, [refreshDevices]);

  // Set default device (kamera pertama) jika belum ada yang dipilih
  useEffect(() => {
    if (devices.length > 0 && !deviceId) {
      setDeviceId(devices[0].deviceId);
    }
  }, [devices, deviceId]);

  return { devices, deviceId, setDeviceId, refreshDevices };
};
