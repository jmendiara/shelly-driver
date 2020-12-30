import { Observable } from 'rxjs';
import {
  Context,
  Shelly1PMRelayAttributes,
  Shelly1PMRelayParameters,
  Shelly1PMSettingsAttributtes,
  Shelly1PMSettingsParameters,
  Shelly1PMStatus,
  Shelly1PMStatusProperty,
  Shelly1PMTrackProperties,
  ShellyModelIdentifier,
  StatePropertyValue,
} from './model';
import { MqttAdapters } from '../trackers';
import { Shelly1 } from './shelly1';
import { deviceMap } from './registry';

export class Shelly1PM extends Shelly1 {
  public type: ShellyModelIdentifier = 'SHSW-PM';

  getTrackProperties(): Shelly1PMTrackProperties {
    return {
      ...super.getTrackProperties(),
      temperature: {
        coiot: [3104, Number],
        mqtt: ['temperature', MqttAdapters.Number],
      },
      'tmp.tC': {
        coiot: [3104, Number],
        mqtt: ['temperature', MqttAdapters.Number],
      },
      'tmp.tF': {
        coiot: [3105, Number],
        mqtt: ['temperature_f', MqttAdapters.Number],
      },
      overtemperature: {
        coiot: [6101, Number],
        mqtt: ['overtemperature', MqttAdapters.Boolean],
      },
      'relays.0.overpower': {
        coiot: [6102, Boolean],
        mqtt: ['relay/0', MqttAdapters.BooleanValue('overpower')],
      },
      'meters.0.power': {
        coiot: [4101, Number],
        mqtt: ['relay/0/power', MqttAdapters.Number],
      },
      'meters.0.total': {
        coiot: [4103, Number],
        mqtt: ['relay/0/energy', MqttAdapters.Number],
      },
      'meters.0.overpower': {
        coiot: [6109, Number],
        mqtt: ['relay/0/overpower_value', MqttAdapters.Number],
      },
    };
  }
}

export interface Shelly1PM extends Shelly1 {
  getSettings(context?: Context): Promise<Shelly1PMSettingsAttributtes>;
  setSettings(params: Partial<Shelly1PMSettingsParameters>, context?: Context): Promise<Shelly1PMSettingsAttributtes>;
  getStatus(context?: Context): Promise<Shelly1PMStatus>;
  getRelay(context?: Context): Promise<Shelly1PMRelayAttributes>;
  setRelay(params: Partial<Shelly1PMRelayParameters>, context?: Context): Promise<Shelly1PMRelayAttributes>;
  observe(path: Shelly1PMStatusProperty, context?: Context): Observable<StatePropertyValue>;
}

deviceMap.set('SHSW-1', Shelly1);
