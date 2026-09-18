import { LocationCoordinates, OfficeConfig } from '../types';

export const DEFAULT_OFFICE: OfficeConfig = {
  name: 'Head Office & Production Workshop',
  companyName: 'Kaosan Apparel',
  companyLogo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
  companyPhoto: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
  tagline: 'Custom Apparel & Premium Garment Production',
  industry: 'Tekstil, Konveksi & Fashion Apparel',
  email: 'halo@kaosanapparel.com',
  phone: '0812-3456-7890',
  website: 'https://kaosanapparel.com',
  taxId: '01.234.567.8-901.000',
  address: 'Gedung Menara Thamrin Lt. 18, Jl. M.H. Thamrin No. 3, Jakarta Pusat',
  lat: -6.1869,
  lng: 106.8236,
  radiusMeters: 150, // 150 meter geofence
  shiftStartTime: '08:30',
  shiftEndTime: '17:30',
  lateGracePeriodMinutes: 15,
  latePenaltyPerOccurrence: 25000,
  overtimeHourlyRate: 35000,
};

/**
 * Calculate distance between two coordinates in meters using the Haversine formula
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export interface GeolocationResult {
  coords: LocationCoordinates;
  isSimulated?: boolean;
  error?: string;
}

/**
 * Get current device GPS location or return simulated coordinate inside/outside office
 */
export async function getCurrentGPSLocation(
  office: OfficeConfig = DEFAULT_OFFICE,
  simulateInsideOffice: boolean = false
): Promise<GeolocationResult> {
  if (simulateInsideOffice) {
    // Add tiny random offset (approx 20-40 meters within office)
    const latOffset = (Math.random() - 0.5) * 0.0003;
    const lngOffset = (Math.random() - 0.5) * 0.0003;
    const lat = office.lat + latOffset;
    const lng = office.lng + lngOffset;
    const distance = calculateDistanceInMeters(lat, lng, office.lat, office.lng);

    return {
      coords: {
        lat,
        lng,
        accuracy: 12,
        address: office.address,
        distanceToOffice: distance,
        isWithinRadius: distance <= office.radiusMeters,
      },
      isSimulated: true,
    };
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coords: {
          lat: office.lat,
          lng: office.lng,
          accuracy: 50,
          address: 'Geolocation tidak didukung oleh browser, menggunakan titik kantor',
          distanceToOffice: 0,
          isWithinRadius: true,
        },
        error: 'Geolocation tidak didukung pada perangkat ini.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const distance = calculateDistanceInMeters(lat, lng, office.lat, office.lng);
        resolve({
          coords: {
            lat,
            lng,
            accuracy: Math.round(pos.coords.accuracy),
            address: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
            distanceToOffice: distance,
            isWithinRadius: distance <= office.radiusMeters,
          },
          isSimulated: false,
        });
      },
      (err) => {
        console.warn('Geolocation error, fallback to simulated inside office:', err.message);
        // Graceful fallback if permission denied or iframe restrictions
        const distance = 45; // 45m within radius
        resolve({
          coords: {
            lat: office.lat + 0.0002,
            lng: office.lng + 0.0002,
            accuracy: 25,
            address: `${office.address} (GPS izin terbatas, dialihkan ke radius kantor)`,
            distanceToOffice: distance,
            isWithinRadius: true,
          },
          isSimulated: true,
          error: `Izin GPS: ${err.message}. Digunakan koordinat estimasi kantor.`,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}
