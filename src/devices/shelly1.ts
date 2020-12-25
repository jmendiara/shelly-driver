import { Observable } from 'rxjs';
import { ShellyDevice } from './base';
import {
  Context,
  StatePropertyValue,
  Shelly1TrackProperties,
  Shelly1SettingsAttributtes,
  Shelly1Status,
  Shelly1StatusProperty,
} from './model';

import { MqttAdapters } from '../clients/trackers';

export class Shelly1 extends ShellyDevice {
  getTrackProperties(): Shelly1TrackProperties {
    // TODO: Find a meaning and a way to manage CoIoT "I":9103,
    return {
      ...super.getTrackProperties(),
      'relays.0.ison': {
        coiot: [1101, Boolean],
        mqtt: ['relay/0', MqttAdapters.Boolean],
      },
      'inputs.0.input': {
        coiot: [2101, Number],
        mqtt: ['input/0', MqttAdapters.Number],
      },
      'inputs.0.event': {
        coiot: [2102, String],
        mqtt: ['input_event/0', MqttAdapters.JSON('event', MqttAdapters.String)],
      },
      'inputs.0.event_cnt': {
        coiot: [2103, Number],
        mqtt: ['input_event/0', MqttAdapters.JSON('event_cnt', MqttAdapters.Number)],
      },
      // TODO: support 999 as invalid value
      'ext_temperature.0.tC': {
        coiot: [3101, Number],
        mqtt: ['ext_temperature/0', MqttAdapters.Number],
      },
      'ext_temperature.0.tF': {
        coiot: [3102, Number],
        mqtt: ['ext_temperature_f/0', MqttAdapters.Number],
      },
      'ext_temperature.1.tC': {
        coiot: [3201, Number],
        mqtt: ['ext_temperature/1', MqttAdapters.Number],
      },
      'ext_temperature.1.tF': {
        coiot: [3202, Number],
        mqtt: ['ext_temperature_f/1', MqttAdapters.Number],
      },
      'ext_temperature.2.tC': {
        coiot: [3301, Number],
        mqtt: ['ext_temperature/2', MqttAdapters.Number],
      },
      'ext_temperature.2.tF': {
        coiot: [3302, Number],
        mqtt: ['ext_temperature_f/2', MqttAdapters.Number],
      },
      'ext_humidity.0.hum': {
        coiot: [3103, Number],
        mqtt: ['ext_humidity/0', MqttAdapters.Number],
      },
      'ext_switch.0.input': {
        coiot: [3117, Number],
        // TODO: There is not a topic documented in https://shelly-api-docs.shelly.cloud/#shelly1-1pm-status
        // mqtt: ['relay/0', MqttAdapters.Number],
      },
    };
  }
}

export interface Shelly1 extends ShellyDevice {
  getSettings(context?: Context): Promise<Shelly1SettingsAttributtes>;
  getStatus(context?: Context): Promise<Shelly1Status>;
  // TODO: research how this typing can be avoided and guess from Status interface directly
  observe(path: Shelly1StatusProperty, context?: Context): Observable<StatePropertyValue>;
}
