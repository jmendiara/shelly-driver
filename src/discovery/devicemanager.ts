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

  private async onUp({ host, type }: RemoteService) {
    try {
      const device = await this.createDevice({ host });
      debug(`[${device.host}] New ${device.type} shelly`);
      this.devices$.next(device);
    } catch (err) {
      debug(`Not a Shelly device at ${host}`);
    }
  }

  discover(): Observable<ShellyDevice> {
    return new Observable((susbcriber) => {
      debug(`Start`);
      if (!this.httpBrowser) {
        // shelly1pm advertises itself as `type: shelly`. Other shellies as `type: http`, so cannot trust
        // the type anymore
        this.httpBrowser = bonjour.find({}, this.onUp.bind(this));
      } else {
        this.httpBrowser.start();
      }
      susbcriber.next();
      return () => {
        debug(`Stop`);
        this.httpBrowser.stop();
      };
    }).pipe(switchMapTo(this.devices$));
  }

  /**
   * Creates a device instance to use later
   */
  async createDevice({ host }: { host: string }): Promise<ShellyDevice> {
    // XXX : This can be a raw request to /shelly endpoint
    const dummyDevice = new ShellyDevice({ host });
    const { type } = await dummyDevice.getBasicSettings();
    const DeviceImpl = deviceMap.get(type);
    let device: ShellyDevice;
    if (DeviceImpl) {
      device = new DeviceImpl({ host });
    } else {
      device = new ShellyDevice({ host });
    }
    return device;
  }
}
