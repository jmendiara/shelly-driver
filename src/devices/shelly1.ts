import { Observable } from 'rxjs';
import { ShellyDevice } from './base';
import {
  Context,
  StatePropertyValue,
  Shelly1PushProperties,
  Shelly1SettingsAttributtes,
  Shelly1Status,
  Shelly1StatusProperty,
} from './model';

export class Shelly1 extends ShellyDevice {
  getPushProperties(): Shelly1PushProperties {
    // TODO: Find a meaning and a way to manage CoIoT "I":9103,
    return {
      ...super.getPushProperties(),
      'relays.0.ison': {
        coiot: 1101,
        mqtt: 'relay/0',
        type: (val: string | number) => (val === 'on' || val === 1 ? true : false),
      },
      'inputs.0.input': {
        coiot: 2101,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'inputs.0.event': {
        coiot: 2102,
        mqtt: 'relay/0', // TODO
        type: String,
      },
      'inputs.0.event_cnt': {
        coiot: 2103,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'ext_temperature.0.tC': {
        coiot: 3101,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'ext_temperature.0.tF': {
        coiot: 3102,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'ext_temperature.1.tC': {
        coiot: 3201,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'ext_temperature.1.tF': {
        coiot: 3202,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'ext_temperature.2.tC': {
        coiot: 3301,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'ext_temperature.2.tF': {
        coiot: 3302,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'ext_humidity.0.hum': {
        coiot: 3103,
        mqtt: 'relay/0', // TODO
        type: Number,
      },
      'ext_switch.0.input': {
        coiot: 3117,
        mqtt: 'relay/0', // TODO
        type: Number,
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
