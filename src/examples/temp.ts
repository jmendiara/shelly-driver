import { Shelly1 } from '../';
import { DeviceManager } from '../';
import { filter } from 'rxjs/operators';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const manager = new DeviceManager();
const discovery$ = manager.discover();
const shelly1$ = discovery$.pipe(filter<Shelly1>((device) => device.type === 'SHSW-1'));

shelly1$.subscribe(async (device) => {
  let cont = 0;

  device.observe('relays.0.ison').subscribe(
    (ison: boolean) => {
      cont++;
      console.log(`[${device.host}]---------${cont}--------`, ison);
    },
    (err) => console.error('BUM!', err),
    () => console.log('COMPLETE'),
  );

  const uptime = device.observe('uptime').subscribe((uptime: number) => {
    console.log(`[${device.host}]-------UPTIME-----`, uptime);
  });

  await delay(10000);
  console.log('Subscribing again to relays');
  device.observe('relays.0.ison').subscribe(
    (ison: boolean) => {
      cont++;
      console.log(`[${device.host}]2--------${cont}--------`, ison);
    },
    (err) => console.error('BUM!', err),
    () => console.log('COMPLETE'),
  );
  await delay(10000);

  console.log('Unsubscribing from uptime');
  uptime.unsubscribe();
});
