import { ClientFactory, defaultClientFactory, TrackingClient } from '../clients';
import { AxiosInstance } from 'axios';
import qs from 'qs';
import { Observable } from 'rxjs';
import { CoIoTClient, CoIoTDescription, CoIoTStatus } from 'coiot-coap';
import { PropertyValue, DeviceState } from './state';
import { switchMap, switchMapTo, tap } from 'rxjs/operators';

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
  protected trackingClient: TrackingClient;

  protected coiotClient: CoIoTClient;

  protected state: DeviceState<ShellyStatus>;

  constructor(options: ShellyDeviceOptions) {
    this.options = options;
    this.host = options.host;

    const clientFactory = options.clientFactory || defaultClientFactory;

    this.httpClient = clientFactory.getHttpClient(this);
    this.coiotClient = clientFactory.getCoIoTClient(this);
    this.trackingClient = clientFactory.getTrackingClient(this);
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

  observe(path: ShellyStatusProperty, context?: Context): Observable<PropertyValue> {
    return this.trackingClient.track(path).pipe(
      tap((observation) => this.state.update(observation)),
      switchMapTo(this.state.observe(path)),
    );
  }

  getPushProperties(context?: Context): ShellyPushProperties {
    return {};
  }
}

type Custom = (value: unknown) => PropertyValue;
export type ShellyPushPropertyType = typeof Boolean | typeof Number | typeof String | Custom;
export interface ShellyPushProperty {
  coiot?: number;
  mqtt?: string;
  type: ShellyPushPropertyType;
}
export type ShellyPushProperties = Partial<Record<ShellyStatusProperty, ShellyPushProperty>>;

// TODO: Investigate how to generate this using typescript from the ShellyStatus interface
export type ShellyStatusProperty =
  | 'wifi_sta.connected'
  | 'wifi_sta.ssid'
  | 'wifi_sta.ip'
  | 'wifi_sta.rssi'
  | 'cloud.enabled'
  | 'cloud.connected'
  | 'mqtt.connected'
  | 'time'
  | 'unixtime'
  | 'update.status'
  | 'update.has_update'
  | 'update.new_version'
  | 'update.old_version'
  | 'update.beta_version'
  | 'ram_total'
  | 'ram_free'
  | 'ram_lwm'
  | 'fs_size'
  | 'fs_free'
  | 'uptime';

/** Allows specifying custom per-request information to be sent to the device via the httpClient */
export interface Context {
  headers: Record<string, string>;
}

export enum ShellyModelIdentifier {
  Shelly1 = 'SHSW-1',
  Shelly25 = 'SHSW-25',
}

export interface ShellyBasicInfo {
  /** Shelly model identifier */
  type: ShellyModelIdentifier;
  /** MAC address of the device */
  mac: string;
  /** Whether HTTP requests require authentication */
  auth: boolean;
  /** Current firmware version */
  fw: string;
  /** 1 if the device identifies itself with its full MAC address; 0 if only the last 3 bytes are used */
  longid?: number;
}

export interface ShellySettingsAttributes {
  device: {
    /** Device model identifier */
    type: ShellyModelIdentifier;
    /** MAC address of the device in hexadecimal  */
    mac: string;
    /** Device hostname */
    hostname: string;
    /** TODO: seen experimentally on SHSW-1 */
    num_outputs?: number;
  };

  /** WiFi access point configuration, see /settings/ap for details */
  wifi_ap: ShellyAccessPointAttributes;

  /** WiFi client configuration. See /settings/sta for details */
  wifi_sta: ShellySTAAttributes;

  /** WiFi client configuration. See /settings/sta for details */
  wifi_sta1: ShellySTAAttributes;

  /** Contains MQTT-related settings */
  mqtt: {
    /** Enable connecting to a MQTT broker */
    enable: boolean;

    /**  MQTT broker IP address and port, ex. 10.0.0.1:1883 */
    server: string;

    /** MQTT username, leave empty to disable authentication */
    user: string;

    /**
     * MQTT ID -- by default this has the form <shellymodel>-<deviceid> e.g. shelly1-B929CC.
     * If you wish to use custom a MQTT ID, it is recommended that it doesn't exceed 25 characters.
     */
    id: string;

    /** Maximum interval for reconnect attempts */
    reconnect_timeout_max: number;

    /** Minimum interval for reconnect attempts */
    reconnect_timeout_min: number;

    /** MQTT clean session flag */
    clean_session: boolean;

    /** MQTT keep alive period in seconds */
    keep_alive: number;

    /** Max value of QOS for MQTT packets */
    max_qos: number;

    /** MQTT retain flag */
    retain: boolean;

    /** Periodic update in seconds, 0 to disable */
    update_period: number;
  };

  coiot: {
    /** Update period of CoIoT messages, seconds */
    update_period: number;
  };

  sntp: {
    /** Time server host  */
    server: string;
    /** SNTP enabled flag */
    enabled: boolean;
  };

  /**
   * Credentials used for HTTP Basic authentication for the REST interface.
   * If login.enabled is true clients must include an Authorization: Basic ... HTTP header
   * with valid credentials when performing TP requests */
  login: ShellyLoginAttributes;

  /** Current generated PIN code */
  pin_code: string;

  /** Unique name of the device */
  name: string;

  /** Current FW version */
  fw: string;

  /** Device discoverable (i.e. visible) flag  */
  discoverable: boolean;

  /** Build info */
  build_info: {
    build_id: string;
    build_timestamp: string;
    build_version: string;
  };

  cloud: {
    /** Cloud enabled flag */
    enabled: boolean;
    /** Cloud connected flag */
    connected: boolean;
  };

  /** Timezone identifier */
  timezone: string;

  /** Degrees latitude in decimal format, South is negative */
  lat: number;

  /** Degrees longitude in decimal fomrat, between -180° and 180° */
  lng: number;

  /** Timezone auto-detect enabled */
  tzautodetect: boolean;

  /** UTC offset */
  tz_utc_offset: number;

  /** Daylight saving time */
  tz_dst: boolean;

  /** Auto update daylight saving time */
  tz_dst_auto: boolean;

  /** Current time in HH:MM format if synced */
  time: string;

  /** Unix timestamp if synced; 0 otherwise */
  unixtime: number;

  /** Current firmware mode, only for devices where this is changeable (e.g. Shelly RGBW2 Color/RGBW2 White) */
  fw_mode?: string;
}

export interface ShellySettingsParameters {
  /** Will perform a factory reset of the device */
  reset?: boolean;

  /** Enable connecting to a MQTT broker */
  mqtt_enable: boolean;

  /**  MQTT broker IP address and port, ex. 10.0.0.1:1883 */
  mqtt_server: string;

  /** MQTT clean session flag */
  mqtt_clean_session: boolean;

  /** MQTT retain flag */
  mqtt_retain: boolean;

  /** MQTT username, leave empty to disable authentication */
  mqtt_user: boolean;

  /** MQTT password */
  mqtt_pass: string;

  /**
   * MQTT ID -- by default this has the form <shellymodel>-<deviceid> e.g. shelly1-B929CC.
   * If you wish to use custom a MQTT ID, it is recommended that it doesn't exceed 25 characters.
   */
  mqtt_id: string;

  /** Maximum interval for reconnect attempts */
  mqtt_reconnect_timeout_max: number;

  /** Minimum interval for reconnect attempts */
  mqtt_reconnect_timeout_min: number;

  /** MQTT keep alive period in seconds */
  mqtt_keep_alive: number;

  /** Periodic update in seconds, 0 to disable */
  mqtt_update_period: number;

  /** Max value of QOS for MQTT packets */
  mqtt_max_qos: number;

  /** Update period of CoIoT messages 15..65535s */
  coiot_update_period: number;

  /**
   * Time server host to be used instead of the default time.google.com.
   *  An empty value disables timekeeping and requires reboot to apply.
   */
  sntp_server: string;

  /** User-configurable device name */
  name: string;

  /** Set whether device should be discoverable (i.e. visible) */
  discoverable: boolean;

  /** Timezone identifier */
  timezone: string;

  /** Degrees latitude in decimal format, South is negative */
  lat: number;

  /** Degrees longitude in decimal format, -180°..180° */
  lng: number;

  /**	Set this to false if you want to set custom geolocation (lat and lng) or custom timezone. */
  tzautodetect: boolean;

  /** UTC offset */
  tz_utc_offset: number;

  /** Daylight saving time 0/1 */
  tz_dst: number;

  /** Auto update daylight saving time 0/1 */
  tz_dst_auto: number;
}

/**
 * Provides information about the current WiFi AP configuration and allows changes.
 *
 * The returned document is identical to the one returned by /settings in the wifi_ap key.
 * Shelly devices do not allow the SSID for AP WiFi mode to be changed. Parameters are applied immediately.
 *
 * Setting the enabled flag for AP mode to 1 will automatically disable STA mode.
 */
export interface ShellyAccessPointAttributes {
  /** Whether AP mode is active */
  enabled: boolean;
  /** SSID created by the device's AP */
  ssid: string;
  /** WiFi password required for association with the device's AP */
  key: string;
}

export interface ShellyAccessPointParameters {
  /** Set to 1 to return the device to AP WiFi mode */
  enabled: boolean;
  /** WiFi password required for association with the device's AP */
  key: string;
}

/**
 * Provides information about the current WiFi Client mode configuration and allows changes.
 *
 * The returned document is identical to the one returned by /settings in the wifi_sta key.
 * Parameters are applied immediately.
 *
 * Setting the enabled flag for STA mode to 1 will automatically disable AP mode.
 * An identical resource is available at /settings/sta1. This allows for devices to have a
 * second WiFi STA configuration for fallback, and will cycle between the two when the one
 * currently selected becomes unavailable.
 */
export interface ShellySTAAttributes {
  /** Whether STA mode is active */
  enabled: boolean;

  /** SSID of STA the device will associate with */
  ssid: string;

  /** dhcp or static */
  ipv4_method: string;

  /** Local IP address if ipv4_method is static */
  ip: string;

  /**Local gateway IP address if ipv4_method is static */
  gw: string;

  /** Mask if ipv4_method is static */
  mask: string;

  /** DNS address if ipv4_method is static */
  dns: string;
}

/**
 * Sinve FW v.1.7.0, setting a static IP only requires netmask to be specified, gateway can be left empty.
 * Please note that cloud must be disabled manually before setting a static IP
 * config without a gateway and enabled manually when switching back to dhcp config (/settings/cloud).
 */
export interface ShellySTAParameters {
  /** Set to 1 to make STA the current WiFi mode */
  enabled: boolean;

  /** The WiFi SSID to associate with*/
  ssid: string;

  /** The password required for associating to the given WiFi SSID*/
  key: string;

  /** dhcp or static*/
  ipv4_method: string;

  /** Local IP address if ipv4_method is static*/
  ip: string;

  /** Mask if ipv4_method is static*/
  netmask: string;

  /** Local gateway IP address if ipv4_method is static*/
  gateway: string;

  /** DNS address if ipv4_method is static*/
  dns: string;
}

/**
 * HTTP authentication configuration: enabled flag, credentials.
 *
 * unprotected is initially false and is used by the user interface to
 * show a warning when auth is disabled. If the user wants to keep using
 * Shelly without a password, they can set unprotected to hide the warning.
 *
 * In order to prevent security issues (e.g. when forwarding logs to 3rd parties),
 * since v1.7.0 the password attribute for login protected devices is no longer r
 * eturned on the API call.
 */
export interface ShellyLoginAttributes {
  /** Whether HTTP authentication is required */
  enabled: boolean;

  /** Whether the user is aware of the risks */
  unprotected: boolean;

  /** Username */
  username: string;
}

export interface ShellyLoginParameters {
  /** Whether to require HTTP authentication */
  enabled: boolean;

  /** Whether the user is aware of the risks */
  unprotected: boolean;

  /** Length between 1 and 50 */
  username: string;

  /** Length between 1 and 50 */
  password: string;
}

export interface ShellyCloudAttributes {
  /** is the device connected to Allterco's cloud and allow monitoring and control from anywhere. */
  enabled: boolean;
}

export interface ShellyCloudParameters {
  /** connecte to Allterco's cloud and allow monitoring and control from anywhere. */
  enabled: boolean;
}

// TODO: Review typings
export interface ShellyActionAttributes {
  actions: {
    [key: string]: ShellyAction[];
  };
}

export interface ShellyActionParameters {
  actions: {
    [key: string]: ShellyAction[];
  };
}

export interface ShellyAction {
  /** Channel number */
  index: number;

  /** Action name */
  name?: string;

  /** Enable/disable action */
  enabled: boolean;

  /** Action URL. Max of 5. Max length 256 */
  urls: string[];
}

/**
 * Encapsulates current device status information.
 *
 * While settings can generally be modified and don't react to the environment,
 * this endpoint provides information about transient data which may change due to external conditions.
 */
export interface ShellyStatus {
  /** Current status of the WiFi connection */
  wifi_sta: {
    /** is the wifi connected */
    connected: boolean;

    /** SSID */
    ssid: string;

    /** IP address assigned to this device by the WiFi router */
    ip: string;

    /** Signal strength */
    rssi: string;
  };

  /** Current cloud connection status */
  cloud: {
    enabled: boolean;
    connected: boolean;
  };

  mqtt: {
    /** MQTT connection status, when MQTT is enabled */
    connected: boolean;
  };

  /** The current hour and minutes, in HH:MM format */
  time: string;

  /** Unix timestamp if synced; 0 otherwise */
  unixtime: number;

  /** Cloud serial number */
  serial: number;

  /** Info whether newer firmware version is available, see /ota for more details */
  update: ShellyOTAAttributes;

  /** Total amount of system memory in bytes */
  ram_total: number;

  /** Available amount of system memory in bytes */
  ram_free: number;

  /** Minimal watermark of the system free memory in bytes */
  ram_lwm: number;

  /** Total amount of the file system in bytes */
  fs_size: number;

  /** Available amount of the file system in bytes */
  fs_free: number;

  /** Seconds elapsed since boot */
  uptime: number;
}

/**
 * Provides information about the device firmware version and the ability to trigger an over-the-air update.
 */
export interface ShellyOTAAttributes {
  /** One of idle, pending, updating, unknown */
  status: 'idle' | 'pending' | 'updating' | 'unknown';

  /** 	Whether an update is available */
  has_update: boolean;

  /** ID of new firmware version */
  new_version: string;

  /** ID of old (current) firmware version */
  old_version: string;

  /** ID of beta firmware if one is available. This attribute is optional. */
  beta_version: string;
}

export interface ShellyOTAParameters {
  /** Run firmware update from specified URL */
  url: string;

  /** Run firmware update from default URL */
  update: boolean;

  /** Run firmware update from beta URL(if available) */
  beta: boolean;
}

export interface ShellyWiFiScanAttributes {
  wifiscan: 'failed' | 'done' | 'not AP mode' | 'started' | 'inprogress';
  results: Array<{
    /** SSID */
    ssid: string;
    /** Auth mode: 0=open, 1=WEP, 2=WPA PSK, 3=WPA2 PSK, 4=WPA WPA2 PSK, 5=WPA2 ENTERPRISE */
    auth: number;

    /** Channel */
    channel: number;

    /** BSSID in hex */
    bssid: string;

    /** Signal strength */
    rssi: number;
  }>;
}
