import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set) => ({
      city: '',
      isLocating: false,
      locationError: null,
      
      setCity: (newCity) => set({ city: newCity, locationError: null }),
      
      detectLocation: async () => {
        set({ isLocating: true, locationError: null });
        
        if (!navigator.geolocation) {
          set({ isLocating: false, locationError: 'Geolocation is not supported by your browser.' });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Use Nominatim OpenStreetMap API for reverse geocoding
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
              
              if (!res.ok) throw new Error('Failed to fetch location data');
              
              const data = await res.json();
              
              // Nominatim returns city, town, or village in the address object
              const detectedCity = data.address.city || data.address.town || data.address.village || data.address.county || '';
              
              if (detectedCity) {
                set({ city: detectedCity, isLocating: false });
              } else {
                set({ isLocating: false, locationError: 'Could not determine your city from coordinates.' });
              }
            } catch (err) {
              set({ isLocating: false, locationError: 'Error fetching location details.' });
            }
          },
          (error) => {
            let errorMsg = 'Unable to retrieve your location.';
            if (error.code === error.PERMISSION_DENIED) errorMsg = 'Location permission denied.';
            set({ isLocating: false, locationError: errorMsg });
          },
          { timeout: 10000 }
        );
      }
    }),
    {
      name: 'seva-sarthi-location', // Store in local storage
    }
  )
);
