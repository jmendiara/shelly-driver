/**
 * All the Shelly Models
 * TODO: move to algebraic type
 */
export enum ShellyModelIdentifier {
  Shelly1 = 'SHSW-1',
  Shelly25 = 'SHSW-25',
}

/** Allows specifying custom per-request information to be sent to the device via the httpClient */
export interface Context {
  headers: Record<string, string>;
}
