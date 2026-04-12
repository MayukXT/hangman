import { APP_VERSION } from './gameConstants';

export interface UpdateInfo {
  version: string;
  changelog: string;
}

// How the app was installed — used to show the right update UI
export type InstallType = 'installed' | 'portable' | 'unknown';

export interface UpdateProgress {
  downloaded: number;
  total: number;
}

// hang onto the update object so we can download it later when the user says yes
let pendingUpdate: Awaited<ReturnType<typeof import('@tauri-apps/plugin-updater').check>> | null = null;

// checks if there's a newer version available
// uses tauri plugin in the real app, falls back to github in dev mode
// won't crash if it fails - updates shouldn't break anything
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    // if we're in the browser (dev mode), tauri apis won't exist
    if (!('__TAURI_INTERNALS__' in window)) {
      return await checkForUpdateFallback();
    }

    const { check } = await import('@tauri-apps/plugin-updater');
    const update = await check({ timeout: 10000 });

    if (update) {
      pendingUpdate = update;
      return {
        version: update.version,
        changelog: update.body || '',
      };
    }

    return null;
  } catch (e) {
    console.warn('Update check failed:', e);
    return null;
  }
}

// downloads and installs the update
// on windows the app closes when the installer runs, then opens back up
export async function downloadAndInstallUpdate(
  onProgress?: (progress: UpdateProgress) => void
): Promise<boolean> {
  if (!pendingUpdate) return false;

  try {
    let downloaded = 0;
    let total = 0;

    await pendingUpdate.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          total = event.data.contentLength ?? total;
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          onProgress?.({ downloaded, total });
          break;
        case 'Finished':
          onProgress?.({ downloaded: total, total });
          break;
      }
    });

    // restart the app after installing (windows might close before this runs tho)
    const { relaunch } = await import('@tauri-apps/plugin-process');
    await relaunch();
    return true;
  } catch (e) {
    console.error('Update install failed:', e);
    throw e; // let the UI know something went wrong
  }
}

// fallback for dev mode - just checks version.json on github
// can't actually install anything, just tells you there's an update
async function checkForUpdateFallback(): Promise<UpdateInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      'https://raw.githubusercontent.com/MayukXT/hangman/main/version.json',
      { signal: controller.signal, cache: 'no-store' }
    );
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();

    if (!data || typeof data.version !== 'string') return null;

    // compare version numbers
    const parse = (v: string) => v.replace(/^v/i, '').split('.').map(Number);
    const [cur, rem] = [parse(APP_VERSION), parse(data.version)];
    let isNewer = false;
    for (let i = 0; i < Math.max(cur.length, rem.length); i++) {
      const diff = (rem[i] || 0) - (cur[i] || 0);
      if (diff > 0) { isNewer = true; break; }
      if (diff < 0) break;
    }

    if (isNewer) {
      return { version: data.version, changelog: data.changelog || '' };
    }
    return null;
  } catch {
    return null;
  }
}

// are we running as a real desktop app or just in the browser?
export function isTauriApp(): boolean {
  return '__TAURI_INTERNALS__' in window;
}

// Determines whether this is an NSIS/MSI installed app or a portable EXE.
// Returns 'unknown' in browser/dev mode or if the check fails — callers
// should treat 'unknown' the same as 'installed' (don't block the update).
export async function getInstallType(): Promise<InstallType> {
  try {
    if (!isTauriApp()) return 'unknown';
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<string>('get_install_type');
    if (result === 'installed' || result === 'portable') return result;
    return 'unknown';
  } catch {
    return 'unknown'; // fail-safe: never block a real update
  }
}
