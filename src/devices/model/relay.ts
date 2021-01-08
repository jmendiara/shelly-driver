import { Context } from './common';

export interface ShellyRelay {
  getRelay(index: number, context?: Context): Promise<ShellyRelayAttributes>;
  setRelay(index: number, params: Partial<ShellyRelayParameters>, context?: Context): Promise<ShellyRelayAttributes>;
  getRelaySettings(index: number, context?: Context): Promise<ShellyRelaySettingsAttributes>;
}

export interface ShellyRelayAttributes {
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

export interface ShellyRelayParameters {
  /**	This will turn ON/OFF the respective output channel when request is sent */
  turn: 'on' | 'off' | 'toggle';

  /**	A one-shot flip-back timer in seconds */
  timer: number;
}

export interface ShellyRelaySettingsAttributes {
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

export interface ShellyRelaySettingsParameters {
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

  // XXX: the following properties are not documented and can be accesed in /actions endpoints
  // /** Set URL to access when SW input is activated */
  // btn_on_url: string;

  // /**	Set URL to access when SW input is deactivated */
  // btn_off_url: string;

  // /**	Set URL to access when output is activated */
  // out_on_url: string;

  // /**	Set URL to access when output is deactivated */
  // out_off_url: string;

  // /**	Set URL to access on longpush. Works only when button is configured as momentary, momentary_on_release or detached. */
  // longpush_url: string;

  // /** Set URL to access on shortpush. Works only when button is configured as momentary, momentary_on_release or detached. */
  // shortpush_url: string;

  /** Enable schedule timer */
  schedule: boolean;

  /**	Rules for schedule activation, e.g. 0000-0123456-on */
  schedule_rules: string[];
}

export type ShellyRelay0Property =
  | 'relays.0.ison'
  | 'relays.0.has_timer'
  | 'relays.0.timer_started'
  | 'relays.0.timer_duration'
  | 'relays.0.timer_remaining'
  | 'relays.0.source';
