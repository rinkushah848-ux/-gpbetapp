export const APP_VERSION = "1.0.0";

export async function checkForUpdate(): Promise<{
  needsUpdate: boolean;
  downloadUrl: string;
  latestVersion: string;
}> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${API_URL}/api/app-version`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    const needsUpdate = data.latestVersion !== APP_VERSION;
    return {
      needsUpdate,
      downloadUrl: data.downloadUrl || "https://gpbetapp.vercel.app",
      latestVersion: data.latestVersion,
    };
  } catch {
    return { needsUpdate: false, downloadUrl: "", latestVersion: APP_VERSION };
  }
}
