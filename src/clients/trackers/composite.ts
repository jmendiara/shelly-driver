import { Observable, merge } from 'rxjs';
import { ShellyDevice, ShellyStatus, StateProperty } from '../../devices';
import { CoiotTracker } from './coiot';
import { HttpTracker } from './http';
import { Tracker } from './model';
import { MqttTracker } from './mqtt';

export class CompositeTracker implements Tracker {
  protected http: HttpTracker<ShellyStatus>;
  protected coiot: CoiotTracker;
  protected mqtt: MqttTracker;

  constructor(device: ShellyDevice) {
    this.http = new HttpTracker(device);
    this.coiot = new CoiotTracker(device);
    this.mqtt = new MqttTracker(device);
  }

  track(key: string): Observable<StateProperty> {
    return merge(this.coiot.track(key), this.http.track(key), this.mqtt.track(key));
  }
}
