import { Observable, ReplaySubject } from 'rxjs';
import { ShellyDevice } from '../devices';
import { deviceMap } from '../devices/registry';
import Bonjour, { Browser, RemoteService } from 'bonjour';
import { switchMapTo } from 'rxjs/operators';

import Debug from 'debug';
const debug = Debug('shelly:discovery');
const bonjour = Bonjour();

export class DeviceManager {
  devices$ = new ReplaySubject<ShellyDevice>();
  httpBrowser: Browser;

  constructor() {
    this.httpBrowser = bonjour.find({ type: 'http' }, this.onUp.bind(this));
  }

  private async onUp({ host }: RemoteService) {
    try {
      // TODO: This can be a raw request
      const dummyDevice = new ShellyDevice({ host });
      const { type } = await dummyDevice.getBasicSettings();
      const DeviceImpl = deviceMap.get(type);
      let device;
      if (DeviceImpl) {
        device = new DeviceImpl({ host });
      } else {
        device = new ShellyDevice({ host });
      }
      debug(`[${device.host}] New ${device.type} shelly`);
      this.devices$.next(device);
    } catch (err) {
      debug(`Not a Shelly device at ${host}`);
    }
  }

  discover(): Observable<ShellyDevice> {
    return new Observable((susbcriber) => {
      debug(`Start`);
      this.httpBrowser.start();
      susbcriber.next();
      return () => {
        debug(`Stop`);
        this.httpBrowser.stop();
      };
    }).pipe(switchMapTo(this.devices$));
  }
}
