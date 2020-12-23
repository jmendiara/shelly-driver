import {
  Shelly1RelayAttributes,
  Shelly1SettingsAttributtes,
  Shelly1SettingsParameters,
  Shelly1SettingsRelayAttributes,
  Shelly1SettingsRelayParameters,
  Shelly1Status,
} from './shelly1';

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

export interface Shelly1PMSettingsRelayAttributes extends Shelly1SettingsRelayAttributes {
  /** threshold above which an overpower condition will be triggered */
  max_power: number;
}

export interface Shelly1PMSettingsRelayParameters extends Shelly1SettingsRelayParameters {
  /** Set power threshold above which an overpower condition will be triggered */
  max_power: number;
}

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
