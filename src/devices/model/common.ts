/**
 * All the Shelly Models
 */
export type ShellyModelIdentifier = 'SHSW-1' | 'SHSW-PM';

/** Allows specifying custom per-request information to be sent to the device via the httpClient */
export interface Context {
  headers: Record<string, string>;
}
