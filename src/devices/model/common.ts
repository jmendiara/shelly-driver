/**
 * All the Shelly Models
 */
export type ShellyModelIdentifier =
  | 'UNKNOWN' // Device not implemented yet
  | 'SHSW-1' // Shelly1
  | 'SHSW-PM' // Shelly1PM
  | 'SHSW-25' // Shelly2.5
  | 'SHDW-1'; // Shelly DoorWindow 1
/** Allows specifying custom per-request information to be sent to the device via the httpClient */
export interface Context {
  headers: Record<string, string>;
}
