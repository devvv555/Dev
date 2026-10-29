/**
 * GeofenceEngine (Reverse-engineered from Jibble's Location-Based Punch Radar)
 * 
 * Accurately determines if the device is physically located within the PSGIM
 * campus, department block, or seminar hall before allowing an official check-in.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  description: string;
}

// Key Geofence Landmarks for PSGIM Campus
export const PSGIM_ZONES: Record<string, GeofenceZone> = {
  MAIN_CAMPUS: {
    id: 'psgim_main',
    name: 'PSGIM Main Campus Perimeter',
    latitude: 11.0245,
    longitude: 77.0028,
    radiusMeters: 300, // Entire campus perimeter
    description: 'PSG Institute of Management, Peelamedu, Coimbatore',
  },
  MBA_ACADEMIC_BLOCK: {
    id: 'psgim_academic_block',
    name: 'MBA Academic Classrooms (Batches A/B/C/D)',
    latitude: 11.0247,
    longitude: 77.0025,
    radiusMeters: 80, // High-precision classroom zone
    description: 'Ground & Upper floors MBA lecture halls',
  },
  LIBRARY_SEMINAR: {
    id: 'psgim_seminar_hall',
    name: 'PSGIM Convention Centre & Library',
    latitude: 11.0242,
    longitude: 77.0031,
    radiusMeters: 75,
    description: 'Auditoriums and reference library',
  },
};

export interface GeofenceVerificationResult {
  isWithinCampus: boolean;
  closestZone: GeofenceZone;
  distanceMeters: number;
  deviceAccuracyMeters: number;
  isMockLocationDetected: boolean;
  status: 'INSIDE_CAMPUS' | 'OUTSIDE_CAMPUS' | 'SIGNAL_LOW';
  message: string;
}

export const GeofenceEngine = {
  /**
   * Calculates precise distance between two GPS coordinates using the Haversine Formula.
   * Accuracy matches GPS engines used by enterprise apps like Jibble.
   */
  calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's mean radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  /**
   * Evaluates the student's live coordinates against PSGIM geofence perimeters.
   */
  verifyLocation(
    currentLocation: Coordinates,
    targetZoneKey: keyof typeof PSGIM_ZONES = 'MAIN_CAMPUS'
  ): GeofenceVerificationResult {
    const zone = PSGIM_ZONES[targetZoneKey] || PSGIM_ZONES.MAIN_CAMPUS;
    const distance = this.calculateDistanceMeters(
      currentLocation.latitude,
      currentLocation.longitude,
      zone.latitude,
      zone.longitude
    );

    const accuracy = currentLocation.accuracyMeters || 10;
    const isMock = accuracy < 1; // Unnaturally perfect 0m accuracy often indicates spoofers

    // If accuracy is too degraded (e.g. > 100 meters)
    if (accuracy > 100) {
      return {
        isWithinCampus: false,
        closestZone: zone,
        distanceMeters: distance,
        deviceAccuracyMeters: accuracy,
        isMockLocationDetected: false,
        status: 'SIGNAL_LOW',
        message: 'GPS signal weak. Move near a window or check location permissions.',
      };
    }

    const isInside = distance <= zone.radiusMeters;

    return {
      isWithinCampus: isInside,
      closestZone: zone,
      distanceMeters: distance,
      deviceAccuracyMeters: accuracy,
      isMockLocationDetected: isMock,
      status: isInside ? 'INSIDE_CAMPUS' : 'OUTSIDE_CAMPUS',
      message: isInside
        ? `Verified within ${zone.name} (${distance}m from center).`
        : `Outside perimeter. You are ${distance}m away from ${zone.name} (Max allowed: ${zone.radiusMeters}m).`,
    };
  },

  /**
   * Helper to fetch current browser / device coordinates via Geolocation API
   */
  async getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported on this device/environment.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
      );
    });
  },
};
