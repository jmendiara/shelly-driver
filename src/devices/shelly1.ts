import { Observable } from 'rxjs';
import { ShellyDevice } from './base';
import {
  Context,
  StatePropertyValue,
  Shelly1TrackProperties,
  Shelly1SettingsAttributtes,
  Shelly1Status,
  Shelly1StatusProperty,
  Shelly1RelayAttributes,
  Shelly1RelayParameters,
  Shelly1SettingsParameters,
  Shelly1SettingsRelayAttributes,
  Shelly1SettingsRelayParameters,
  Shelly1PowerParameters,
  Shelly1ExternalTemperatureParameters,
  Shelly1ExternalHumidityParameters,
  Shelly1ExternalSwitchParameters,
  ShellyModelIdentifier,
} from './model';

import { MqttAdapters } from '../trackers';
import qs from 'qs';
import { deviceMap } from './registry';
import { ShellyRelay } from './model/relay';

export class Shelly1 extends ShellyDevice implements ShellyRelay {
  public type: ShellyModelIdentifier = 'SHSW-1';

  /** Shows current status of the output channel */
  async getRelay(index: 0, context?: Context): Promise<Shelly1RelayAttributes> {
    const { data } = await this.httpClient.get<Shelly1RelayAttributes>(`/relay/${index}`, context);
    return data;
  }

  /** Accepts commands for controlling the channel. */
  async setRelay(
    index: 0,
    params: Partial<Shelly1RelayParameters>,
    context?: Context,
  ): Promise<Shelly1RelayAttributes> {
    const { data } = await this.httpClient.post<Shelly1RelayAttributes>(
      `/relay/${index}`,
      qs.stringify(params),
      context,
    );
    return data;
  }

  /**
   * The returned document here is identical to the data returned in getSettings
   * for the single output channel in the relays array.
   * The channel index exists to preserve API compatibility with multi-channel Shelly devices.
   */
  async getRelaySettings(index: 0, context?: Context): Promise<Shelly1SettingsRelayAttributes> {
    const { data } = await this.httpClient.get<Shelly1SettingsRelayAttributes>(`/settings/relay/${index}`, context);
    return data;
  }

  async setRelaySettings(
    index: 0,
    params: Partial<Shelly1SettingsRelayParameters>,
    context?: Context,
  ): Promise<Shelly1SettingsRelayAttributes> {
    const { data } = await this.httpClient.post<Shelly1SettingsRelayAttributes>(
      `/settings/relay/${index}`,
      qs.stringify(params),
      context,
    );
    return data;
  }

  async setPowerSettings(
    index: 0,
    params: Partial<Shelly1PowerParameters>,
    context?: Context,
  ): Promise<Shelly1PowerParameters> {
    const { data } = await this.httpClient.post<Shelly1PowerParameters>(
      `/settings/power/${index}`,
      qs.stringify(params),
      context,
    );
    return data;
  }

  async setExternalTemperatureSettings(
    index: 0 | 1 | 2,
    params: Partial<Shelly1ExternalTemperatureParameters>,
    context?: Context,
  ): Promise<Shelly1ExternalTemperatureParameters> {
    const { data } = await this.httpClient.post<Shelly1ExternalTemperatureParameters>(
      `/settings/ext_temperature/${index}`,
      qs.stringify(params),
      context,
    );
    return data;
  }

  async setExternalHumiditySettings(
    index: 0,
    params: Partial<Shelly1ExternalHumidityParameters>,
    context?: Context,
  ): Promise<Shelly1ExternalHumidityParameters> {
    const { data } = await this.httpClient.post<Shelly1ExternalHumidityParameters>(
      `/settings/ext_humidity/${index}`,
      qs.stringify(params),
      context,
    );
    return data;
  }

  async setExternalSwitchSettings(
    index: 0,
    params: Partial<Shelly1ExternalSwitchParameters>,
    context?: Context,
  ): Promise<Shelly1ExternalSwitchParameters> {
    const { data } = await this.httpClient.post<Shelly1ExternalSwitchParameters>(
      `/settings/ext_switch/${index}`,
      qs.stringify(params),
      context,
    );
    return data;
  }

  getTrackProperties(): Shelly1TrackProperties {
    // TODO: support longpush state (mqtt only)
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
  setSettings(params: Partial<Shelly1SettingsParameters>, context?: Context): Promise<Shelly1SettingsAttributtes>;
  getStatus(context?: Context): Promise<Shelly1Status>;
  observe(path: Shelly1StatusProperty, context?: Context): Observable<StatePropertyValue>;
}

deviceMap.set('SHSW-1', Shelly1);
