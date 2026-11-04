// Browser tokens stay in memory and are discarded on reload.
export async function readRefreshToken(): Promise<string | null> { return null; }
export async function writeRefreshToken(_token: string | null) {}
