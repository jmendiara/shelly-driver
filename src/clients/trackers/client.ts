import { CoiotTracker } from './coiot';
import { HttpTracker } from './http';
import { MqttTracker } from './mqtt';
import { Context, ShellyDevice, ShellyStatus } from '../../devices';
import { merge, Observable } from 'rxjs';
import { Observation } from '../../devices/state';
import Debug from 'debug';

const debug = Debug('shelly:tracker');

export interface TrackingClient {
  track(property: string, context?: Context): Observable<Observation>;
}

export class CompositeTrackingClient implements TrackingClient {
  protected http: HttpTracker<ShellyStatus>;
  protected coiot: CoiotTracker;
  protected mqtt: MqttTracker;

  constructor(device: ShellyDevice) {
    this.http = new HttpTracker(device);
    this.coiot = new CoiotTracker(device);
    this.mqtt = new MqttTracker(device);

  }

  track(key: string, context?: Context): Observable<Observation> {
    return merge(this.coiot.track(key), this.http.track(key), this.mqtt.track(key));
  }
}

