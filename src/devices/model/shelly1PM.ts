import { ShellyTrackProperty } from './base';
import {
  Shelly1RelayAttributes,
  Shelly1RelayParameters,
  Shelly1SettingsAttributtes,
  Shelly1SettingsParameters,
  Shelly1SettingsRelayAttributes,
  Shelly1SettingsRelayParameters,
  Shelly1Status,
  Shelly1StatusProperty,
} from './shelly1';

export type Shelly1PMTrackProperties = Partial<Record<Shelly1PMStatusProperty, ShellyTrackProperty>>;

// TODO: research how this typing can be avoided and guess from Status interface
export type Shelly1PMStatusProperty =
  | Shelly1StatusProperty
  | 'relays.0.overpower'
  | 'meters.0.overpower'
  | 'meters.0.timestamp'
  | 'meters.0.counters'
  | 'meters.0.total'
  | 'tmp.tC'
  | 'tmp.tF'
  | 'tmp.is_valid'
  | 'overtemperature'
  | 'temperature_status'
  | 'temperature';

export interface Shelly1PMSettingsParameters extends Shelly1SettingsParameters {
  /** Power threshold above which an overpower condition will be triggered */
  max_power: number;

  /** Power correction coefficient, [0.85-1.15] */
  power_correction: number;

  /** Whether LED status indication is enabled  */
  led_status_disable: boolean;
}

export interface Shelly1PMSettingsAttributtes extends Shelly1SettingsAttributtes {
  /* Power threshold above which an overpower condition will be triggered */
  max_power: number;

  /** Power correction coefficient */
  power_correction: number;

  /** Whether LED status indication is enabled */
  led_status_disable: boolean;
}

export interface Shelly1PMSettingsParameters extends Shelly1SettingsParameters {
  /** Power threshold above which an overpower condition will be triggered */
  max_power: number;

  /** Power correction coefficient, [0.85-1.15] */
  power_correction: number;

  /** Whether LED status indication is enabled  */
  led_status_disable: boolean;
}

export type Shelly1PMSettingsRelayAttributes = Omit<Shelly1SettingsRelayAttributes, 'power'> & {
  /** threshold above which an overpower condition will be triggered */
  max_power: number;
};

export type Shelly1PMSettingsRelayParameters = Omit<Shelly1SettingsRelayParameters, 'power'> & {
  /** Set power threshold above which an overpower condition will be triggered */
  max_power: number;
};

export interface Shelly1PMStatus extends Shelly1Status<Shelly1PMStatusMeters> {
  /** internal device temperature in °C **/
  temperature: number;
  /** when device has overheated */
  overtemperature: boolean;

  tmp: {
    /** temperature in °C */
    tC: number;
    /** temperature in °F */
    tF: number;
    /**  Whether device temperature is valid */
    is_valid: boolean;
  };

  /** Temperature status of the device */
  temperature_status: 'Normal' | 'High' | 'Very High';
}

/**
 * Note: Energy counters (in the counters array and total) will reset to 0 after reboot.
 */
export interface Shelly1PMStatusMeters {
  /** Current real AC power being drawn, in Watts */
  power: number;

  /** Value in Watts, on which an overpower condition is detected */
  overpower: number;

  /** Whether power metering self-checks OK */
  is_valid: boolean;

  /** Unix timestamp of the last energy counter value */
  timestamp: number;

  /** Energy counter value for the last 3 round minutes in Watt-minute */
  counters: number[];

  /** Total energy consumed by the attached electrical appliance in Watt - minute */
  total: number;
}

export interface Shelly1PMRelayAttributes extends Shelly1RelayAttributes {
  /** if maximum allowed power was exceeded */
  overpower: boolean;
}

export type Shelly1PMRelayParameters = Shelly1RelayParameters;
