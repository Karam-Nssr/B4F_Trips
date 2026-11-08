// Keep true while the backend is not ready. The app will use local demo trips,
// seat layouts and simulated checkout without making any network requests.
// Used only after setting USE_MOCK_DATA to false.
// Android emulator: http://10.0.2.2:5000/api
// iOS simulator:    http://localhost:5000/api
export const USE_MOCK_DATA = false;
export const API_BASE_URL = 'http://192.168.100.71:5000/api';
export const API_TIMEOUT_MS = 15000;
