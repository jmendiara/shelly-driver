import { Shelly1 } from '../';
import { DeviceManager } from '../';
import { filter } from 'rxjs/operators';

const manager = new DeviceManager();
const discovery$ = manager.discover();
const shelly1$ = discovery$.pipe(filter<Shelly1>((device) => device.type === 'SHSW-1'));

shelly1$.subscribe((device) => {
  let cont = 0;
  device.observe('relays.0.ison').subscribe(
    (ison: boolean) => {
      cont++;
      console.log(`[${device.host}]---------${cont}--------`, ison);
    },
    (err) => console.error('BUM!', err),
    () => console.log('COMPLETE'),
  );
});
