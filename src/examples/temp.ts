import { Shelly1 } from '../devices';
import DeviceManager from '../devicemanager';
import { filter } from 'rxjs/operators';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
(async function () {
  const discoveryObs = DeviceManager.discover().pipe(filter<Shelly1>((device) => device.type === 'SHSW-1'));

  const discoverySub = discoveryObs.subscribe(async (device) => {
    let cont = 0;
    const a = device.observe('relays.0.ison').subscribe(
      (ison: boolean) => {
        cont++;
        console.log(`[${device.host}]---------${cont}--------`, ison);
      },
      (err) => console.error('BUM!', err),
      () => console.log('COMPLETE'),
    );
  });

  // const ventilador = new Shelly1({
  //   host: '192.168.31.130',
  // });

  // ventiladorTopics.subscribe((msg) => {
  //   console.log('<===mqtt===|', msg.toString());
  // })

  // const status = await ventilador.getStatus();
  // console.log(status);

  // const basic = await ventilador.getBasicSettings();
  // const settings = await ventilador.getSettings();
  // console.log(settings)

  // const coiotStatus = await ventilador.getCoIoTStatus();
  // logger.info(coiotStatus);

  // const status = await ventilador.getStatus();
  // logger.info(status);

  // let cont = 0;

  // const onObserver = ventilador.observe('relays.0.ison');
  // const sub = onObserver.subscribe(
  //   (ison: boolean) => {
  //     cont++;
  //     console.log(`---------${cont}--------`, ison);
  //   },
  //   (err) => console.log('Toma error!', err),
  // );
  // const otro = ventilador.observe('inputs.0.input');
  // otro.subscribe(
  //   (ison: boolean) => {
  //     cont++;
  //     console.log(`=========${cont}--------`, ison);
  //   },
  //   (err) => console.log('Toma error!', err),
  // );

  // await delay(5000);
  // await ventilador.setRelay({ turn: 'on' });
  // await delay(5000);
  // await ventilador.setRelay({ turn: 'off' });

  //sub.unsubscribe();
})();
