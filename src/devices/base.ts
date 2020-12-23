import { ClientFactory, defaultClientFactory } from '../clients';
import { AxiosInstance } from 'axios';
import qs from 'qs';
import { Observable } from 'rxjs';
import { CoIoTClient, CoIoTDescription, CoIoTStatus } from 'coiot-coap';
import { DeviceState } from './state';
import { switchMapTo, tap } from 'rxjs/operators';
import {
  Context,
  StatePropertyValue,
  ShellyAccessPointAttributes,
  ShellyAccessPointParameters,
  ShellyActionAttributes,
  ShellyActionParameters,
  ShellyBasicInfo,
  ShellyCloudAttributes,
  ShellyCloudParameters,
  ShellyLoginAttributes,
  ShellyLoginParameters,
  ShellyOTAAttributes,
  ShellyOTAParameters,
  ShellyPushProperties,
  ShellySettingsAttributes,
  ShellySettingsParameters,
  ShellySTAAttributes,
  ShellySTAParameters,
  ShellyStatus,
  ShellyStatusProperty,
  ShellyWiFiScanAttributes,
} from './model';
import { Tracker } from 'clients/trackers';

export interface ShellyDeviceOptions {
  host: string;
  clientFactory?: ClientFactory;
}

export abstract class ShellyDevice {
  public host: string;
  /** The general options passed to the base instance for a shelly device */
  protected options: ShellyDeviceOptions;

  /** the httpclient to interact with the HTTP API */
  protected httpClient: AxiosInstance;
  protected tracker: Tracker;

  protected coiotClient: CoIoTClient;

  protected state: DeviceState;

  constructor(options: ShellyDeviceOptions) {
    this.options = options;
    this.host = options.host;

    const clientFactory = options.clientFactory || defaultClientFactory;

    this.httpClient = clientFactory.getHttpClient(this);
    this.coiotClient = clientFactory.getCoIoTClient(this);
    this.tracker = clientFactory.getTracker(this);
    this.state = new DeviceState(this);

    // clientFactory.getMqttClient(this).subscribe((client) => (this.mqttClient = client));
  }

  /**
   * Provides basic information about the device.
   * It does not require HTTP authentication, even if authentication is enabled globally.
   * This endpoint can be used in conjunction with mDNS for device discovery and identification.
   * It accepts no parameters.
   */
  async getBasicSettings(context?: Context): Promise<ShellyBasicInfo> {
    const { data } = await this.httpClient.get<ShellyBasicInfo>('/shelly', context);
    return data;
  }

  /**
   * Get device configuration
   */
  async getSettings(context?: Context): Promise<ShellySettingsAttributes> {
    const { data } = await this.httpClient.get<ShellySettingsAttributes>('/settings', context);
    return data;
  }

  /**
   * Update device configuration
   */
  async setSettings(params: Partial<ShellySettingsParameters>, context?: Context): Promise<ShellySettingsAttributes> {
    const { data } = await this.httpClient.post<ShellySettingsAttributes>('/settings', qs.stringify(params), context);
    return data;
  }

  /**
   * Provides information about the current WiFi AP configuration
   */
  async getAccessPoint(context?: Context): Promise<ShellyAccessPointAttributes> {
    const { data } = await this.httpClient.get<ShellyAccessPointAttributes>('/settings/ap', context);
    return data;
  }

  /**
   * Saves information about the current WiFi AP configuration
   */
  async setAccessPoint(
    params: Partial<ShellyAccessPointParameters>,
    context?: Context,
  ): Promise<ShellyAccessPointAttributes> {
    const { data } = await this.httpClient.post<ShellyAccessPointAttributes>(
      '/settings/ap',
      qs.stringify(params),
      context,
    );
    return data;
  }

  /**
   * Provides information about the current WiFi Client mode
   */
  async getSTA(context?: Context): Promise<ShellySTAAttributes> {
    const { data } = await this.httpClient.get<ShellySTAAttributes>('/settings/sta', context);
    return data;
  }

  /**
   * Saves information about the current WiFi Client mode
   */
  async setSTA(params: Partial<ShellySTAParameters>, context?: Context): Promise<ShellySTAAttributes> {
    const { data } = await this.httpClient.post<ShellySTAAttributes>('/settings/sta', qs.stringify(params), context);
    return data;
  }

  /**
   * Gets HTTP authentication configuration
   */
  async getLogin(context?: Context): Promise<ShellyLoginAttributes> {
    const { data } = await this.httpClient.get<ShellyLoginAttributes>('/settings/login', context);
    return data;
  }

  /**
   * Saves HTTP authentication configuration
   */
  async setLogin(params: Partial<ShellyLoginParameters>, context?: Context): Promise<ShellyLoginAttributes> {
    const { data } = await this.httpClient.post<ShellyLoginAttributes>(
      '/settings/login',
      qs.stringify(params),
      context,
    );
    return data;
  }

  /**
   * Gets Allterco's cloud connection
   */
  async getCloud(context?: Context): Promise<ShellyCloudAttributes> {
    const { data } = await this.httpClient.get<ShellyCloudAttributes>('/settings/cloud', context);
    return data;
  }

  /**
   * Updates Allterco's cloud connection
   */
  async setCloud(params: Partial<ShellyCloudParameters>, context?: Context): Promise<ShellyCloudAttributes> {
    const { data } = await this.httpClient.post<ShellyCloudAttributes>(
      '/settings/cloud',
      qs.stringify(params),
      context,
    );
    return data;
  }

  /**
   * Gets actions defined on the device
   * TODO: It supports filtering!
   */
  async getActions(context?: Context): Promise<ShellyActionAttributes> {
    const { data } = await this.httpClient.get<ShellyActionAttributes>('/settings/actions', context);
    return data;
  }

  /**
   * Updates Allterco's cloud connection
   * TODO: Not Implemented
   */
  async setActions(params: Partial<ShellyActionParameters>, context?: Context): Promise<ShellyActionAttributes> {
    /*
    Examples:
    Setting two URLs for out_on_url action on channel 0:
    http://192.168.33.1/settings/actions?index=0&name=out_on_url&enabled=true&urls[]=http://192.168.1.4/on&urls[]=http://192.168.1.5/on

    Disable only action out_on_url on channel 0:
    http://192.168.33.1/settings/actions?index=0&name=out_on_url&enabled=false

    Delete URLs for action out_on_url action on channel 0:
    http://192.168.33.1/settings/actions?index=0&name=out_on_url&urls[]=

    Some devices have additional parameters which may be set along with actions. Example: Setting URLs and over_power_url_threshold parameter for action over_power_url on channel 0:
    http://192.168.33.1/settings/actions?index=0&name=over_power_url&enabled=true&urls[]=192.168.1.4/overpower&urls[]=192.168.1.5/overpower&over_power_url_threshold=100
    */
    throw new Error('Not implemented');
  }

  /**
   * Encapsulates current device status information.
   *
   * While settings can generally be modified and don't react to the environment,
   * this endpoint provides information about transient data which may change due to external conditions.
   */
  async getStatus(context?: Context): Promise<ShellyStatus> {
    const { data } = await this.httpClient.get<ShellyStatus>('/status', context);
    return data;
  }

  /** When requested will cause a reboot of the device. */
  async reboot(context?: Context): Promise<Record<string, never>> {
    const { data } = await this.httpClient.get<Record<string, never>>('/reboot', context);
    return data;
  }

  /**
   * Provides information about the device firmware version and the ability to trigger an over-the-air update.
   */
  async getOTA(context?: Context): Promise<ShellyOTAAttributes> {
    const { data } = await this.httpClient.get<ShellyOTAAttributes>('/ota', context);
    return data;
  }

  /**
   * trigger an over-the-air update.
   */
  async setOTA(params: Partial<ShellyOTAParameters>, context?: Context): Promise<ShellyOTAAttributes> {
    const { data } = await this.httpClient.post<ShellyOTAAttributes>('/ota', qs.stringify(params), context);
    return data;
  }

  /**
   * Only available when in AP mode. Starts a WiFi scan and provides information about found networks.
   */
  async getWiFiScan(context?: Context): Promise<ShellyWiFiScanAttributes> {
    const { data } = await this.httpClient.get<ShellyWiFiScanAttributes>('/wifiscan', context);
    return data;
  }

  /**
   * Gets the CoIoT device Description
   */
  async getCoiotDescription(context?: Context): Promise<CoIoTDescription> {
    return this.coiotClient.getDescription(context);
  }

  /**
   * Gets the CoIoT device status
   */
  async getCoiotStatus(context?: Context): Promise<CoIoTStatus> {
    return this.coiotClient.getStatus(context);
  }

  /**
   * Observes a property
   */
  observe(path: ShellyStatusProperty): Observable<StatePropertyValue> {
    return this.tracker.track(path).pipe(
      tap((observation) => this.state.update(observation)),
      switchMapTo(this.state.observe(path)),
    );
  }

  getPushProperties(): ShellyPushProperties {
    return {};
  }
}
