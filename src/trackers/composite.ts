import { Observable, merge } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ShellyDevice, StateProperty } from '../devices';
import { CoiotTracker } from './coiot';
import { HttpTracker } from './http';
import { Tracker } from './model';
import { MqttTracker } from './mqtt';
import Debug from 'debug';

const debug = Debug('shelly:tracker:composite');

/**
 * TODO: make smarter: Do a cascade mqtt->coiot->http and retry the cascade
 */
export class CompositeTracker implements Tracker {
  protected http: HttpTracker;
  protected coiot: CoiotTracker;
  protected mqtt: MqttTracker;

  constructor(protected device: ShellyDevice) {
    this.http = new HttpTracker(device);
    this.coiot = new CoiotTracker(device);
    this.mqtt = new MqttTracker(device);
  }

  track(key: string): Observable<StateProperty> {
    return merge(this.coiot.track(key), this.http.track(key), this.mqtt.track(key)).pipe(
      finalize(() => debug(`[${this.device.host}] Stop tracking ${key}`)),
    );
  }
}
