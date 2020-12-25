import {
  ShellyTrackProperty,
  ShellySettingsAttributes,
  ShellySettingsParameters,
  ShellyStatus,
  ShellyStatusProperty,
} from './base';

export type Shelly1TrackProperties = Partial<Record<Shelly1StatusProperty, ShellyTrackProperty>>;

// TODO: research how this typing can be avoided and guess from Status interface
export type Shelly1StatusProperty =
  | ShellyStatusProperty
  | 'relays.0.ison'
  | 'relays.0.has_timer'
  | 'relays.0.timer_started'
  | 'relays.0.timer_duration'
  | 'relays.0.timer_remaining'
  | 'relays.0.overpower'
  | 'relays.0.source'
  | 'meters.0.power'
  | 'meters.0.is_valid'
  | 'inputs.0.input'
  | 'inputs.0.event'
  | 'inputs.0.event_cnt'
  | 'ext_sensors.temperature_unit'
  | 'ext_temperature.0.hwID'
  | 'ext_temperature.0.tC'
  | 'ext_temperature.0.tF'
  | 'ext_temperature.1.hwID'
  | 'ext_temperature.1.tC'
  | 'ext_temperature.1.tF'
  | 'ext_temperature.2.hwID'
  | 'ext_temperature.2.tC'
  | 'ext_temperature.2.tF'
  | 'ext_humidity.0.hwID'
  | 'ext_humidity.0.hum'
  | 'ext_switch.0.input';

export interface Shelly1SettingsAttributtes extends ShellySettingsAttributes {
  /** Whether factory reset via 5-time flip of the input switch is enabled */
  factory_reset_from_switch: boolean;

  /** always relay */
  mode: 'relay';

  /** Duration to detect long push, ms */
  longpush_time: number;

  /** Current relay settings, see /settings/relay/0 */
  relays: Shelly1SettingsRelayAttributes[];

  /** Contains information about instantaneous power and cumulative energy counter, see /status */
  meters?: Shelly1StatusMeters[];

  /**
   * If add - on attached(DS1820 / DHT22): External temperature unit C / F
   */
  ext_sensors: {
    temperature_unit: string;
  };

  /**
   * If add-on attached (DS1820/DHT22):
   * External temperature thresholds and actions, see /settings/ext_temperature/{index}
   */
  ext_temperature: Record<0 | 1 | 2, Shelly1ExternalTemperatureAttributes>;

  /**
   * If add-on attached (DHT22 only):
   * External humidity thresholds and actions, see /settings/ext_humidity/0
   */
  ext_humidity: Record<0, Shelly1ExternalHumidityAttributes>;

  /**
   * If low-power switch add-on attached:
   * Information about the status of the external switch
   */
  ext_switch: Record<0, Shelly1ExternalSwitchAttributes>;
}

export interface Shelly1SettingsParameters extends ShellySettingsParameters {
  /** Enable/disable factory reset via 5-time flip of the input switch */
  factory_reset_from_switch: boolean;

  /** Only value relay is allowed for these */
  mode: 'relay';

  /** Set duration to detect long push, 1..5000ms */
  longpush_time: number;

  /**
   * If add-on attached (DS1820/DHT22): Set external temperature unit C/F
   */
  ext_sensors_temperature_unit?: string;
}

export interface Shelly1SettingsRelayAttributes {
  /** Relay name */
  name: string;

  appliance_type: string;

  /**	Relay state */
  ison: boolean;

  /**	Whether there is an active timer */
  has_timer: boolean;

  /**State on power-on, one of off, on, last, switch */
  default_state: 'on' | 'off' | 'last' | 'switch';

  /** Button type */
  btn_type: 'momentary' | 'toggle' | 'edge' | 'detached' | 'action' | 'momentary_on_release';

  /**	Whether logical state of the input is inverted */
  btn_reverse: number;

  /**	Automatic flip back timer, seconds */
  auto_on: number;

  /**	Automatic flip back timer, seconds */
  auto_off: number;

  /**
   * Shelly1 only
   * User power constant to display in meters when relay is on, see /settings/power/0
   */
  power: number;

  /**	Whether scheduling is enabled */
  schedule: boolean;

  /**	Rules for schedule activation */
  schedule_rules: string[];
}

export interface Shelly1SettingsRelayParameters {
  /** Submitting a non-empty value will reset settings for the output to factory defaults */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reset: any;

  /** Set relay name */
  name: string;

  /** Accepted values: off, on, last, switch */
  default_state: string;

  /** Accepted values: momentary, toggle, edge, detached, action, momentary_on_release */
  btn_type: string;

  /** Inverts the logical state of the input */
  btn_reverse: boolean;

  /** Automatic flip back timer, seconds. Will engage after turning Shelly1/1PM OFF */
  auto_on: number;

  /** Automatic flip back timer, seconds. Will engage after turning Shelly1/1PM ON */
  auto_off: number;

  /** Shelly1 only Set user power constant to display in meters when relay is on, see /settings/power/0 */
  power: number;

  /** Set URL to access when SW input is activated */
  btn_on_url: string;

  /**	Set URL to access when SW input is deactivated */
  btn_off_url: string;

  /**	Set URL to access when output is activated */
  out_on_url: string;

  /**	Set URL to access when output is deactivated */
  out_off_url: string;

  /**	Set URL to access on longpush. Works only when button is configured as momentary, momentary_on_release or detached. */
  longpush_url: string;

  /** Set URL to access on shortpush. Works only when button is configured as momentary, momentary_on_release or detached. */
  shortpush_url: string;

  /** Enable schedule timer */
  schedule: boolean;

  /**	Rules for schedule activation, e.g. 0000-0123456-on */
  schedule_rules: string[];
}

export interface Shelly1PowerParameters {
  /** Set user power constant to display in meters when relay is on, 0..4000W */
  power: number;
}

/**
 * Only applicable if add-on attached (DS1820/DHT22)
 * Temperature thresholds: The values of over-/under-temperature thresholds must be inside
 * the ranges measurable by the DS1820/DHT22 sensors:
 *
 * DS1820: [-55 / 125 ]°C, [-67 / 257]°F
 * DHT22: [-40 / 80]°C, [-40 / 176]°F
 */
export interface Shelly1ExternalTemperatureAttributes {
  /**	Temperature (in °C) over which to trigger overtemp_act */
  overtemp_threshold_tC: number;

  /**	Temperature (in °F) over which to trigger overtemp_act */
  overtemp_threshold_tF: number;

  /**	Temperature (in °C) under which to trigger undertemp_act */
  undertemp_threshold_tC: number;

  /**	Temperature (in °F) under which to trigger undertemp_act */
  undertemp_threshold_tF: number;

  /**	Over-temperature action, one of disabled, relay_on, relay_off */
  overtemp_act: 'disabled' | 'relay_on' | 'relay_of';

  /**	Under - temperature action, one of disabled, relay_on, relay_off */
  undertemp_act: 'disabled' | 'relay_on' | 'relay_of';
}

/**
 * Only applicable if add-on attached (DHT22)
 */
export interface Shelly1ExternalHumidityAttributes {
  /**	Humidity (in %) over which to trigger overhum_act */
  overhum_threshold: number;

  /**	Humidity (in %) under which to trigger underhum_act */
  underhum_threshold: number;

  /**	Over-humidity action, one of disabled, relay_on, relay_off */
  overhum_act: 'disabled' | 'relay_on' | 'relay_of';

  /**	Under-humidity action, one of disabled, relay_on, relay_off */
  underhum_act: 'disabled' | 'relay_on' | 'relay_of';
}

/**
 * Only applicable if low-power switch add-on attached
 */
export interface Shelly1ExternalSwitchAttributes {
  /** State of the external switch */
  input: number;
}

export interface Shelly1Status<T = Shelly1StatusMeters> extends ShellyStatus {
  /** Contains the current state of the relay output channels. */
  relays: Shelly1RelayAttributes[];

  /** Contains information about instantaneous power and cumulative energy counter, see description below */
  meters: T[];

  /** Current state of the inputs, see description below */
  inputs: Shelly1StatusInputs;

  /**	If add - on attached(DS1820 / DHT22)*/
  ext_sensors: {
    /** external temperature unit C / F  */
    temperature_unit: string;
  };

  /** If add - on attached(DS1820 / DHT22): external temperature data */
  ext_temperature: Record<0 | 1 | 2, Shelly1StatusExternalTemperature>;

  /* If add - on attached(DHT22 only): external humidity data */
  ext_humidity: Record<0, Shelly1StatusExternalHumidity>;

  /** If low-power switch add-on attached: Information about the status of the external switch */
  ext_switch: Record<0, Shelly1StatusExternalSwitch>;
}

export interface Shelly1StatusMeters {
  /** When relay is on, displays the value of the user power constant (see /settings/power/0); otherwise  */
  power: number;
  /** Always true */
  is_valid: boolean;
}

/**
 * input shows the current logical state of the input: 0=OFF and 1=ON.
 * event provides a short string, designating the last detected input event (shortpush/longpush).
 * event_cnt is incremented each time a new input event occurs.
 * event_cnt is not stored in non-volatile memory.
 *
 * Input events are only detected when btn_type is configured as momentary, momentary_on_release or detached.
 */
export interface Shelly1StatusInputs {
  /** Current state of the input */
  input: 0 | 1;

  /** Last input event, S=shortpush, L=longpush, ""=none/invalid  */
  event: 'S' | 'L' | '';

  /** Event counter, uint16 */
  event_cnt: number;
}

export interface Shelly1StatusExternalTemperature {
  /* 	Hardware ID of sensor {index} */
  hwID: string;

  /**	Temperature reading of sensor {index}, °C, 999 if invalid */
  tC: number;

  /** Temperature reading of sensor {index}, °F, 999 if invalid */
  tF: number;
}

export interface Shelly1StatusExternalHumidity {
  /* 	Hardware ID of sensor {index} */
  hwID: string;

  /**	Humidity reading of sensor 0, percent, 999 if invalid*/
  hum: number;
}

export interface Shelly1StatusExternalSwitch {
  /** State of the external switch */
  input: number;
}

export interface Shelly1RelayAttributes {
  /** Whether the channel is turned ON or OFF */
  ison: boolean;
  /** Whether a timer is currently armed for this channel */
  has_timer: boolean;
  /** Unix timestamp of timer start; 0 if timer inactive or time not synced */
  timer_started: number;
  /** Timer duration, s */
  timer_duration: number;
  /** experimental If there is an active timer, shows seconds until timer elapses; 0 otherwise */
  timer_remaining: number;
  /** Source of the last relay command */
  source: string;
}

export interface Shelly1RelayParameters {
  /**	This will turn ON/OFF the respective output channel when request is sent */
  turn: 'on' | 'off' | 'toggle';

  /**	A one-shot flip-back timer in seconds */
  timer: number;
}
