export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function checkBackendHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }

  return response.json();
}
