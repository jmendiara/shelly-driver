import { Shelly1 } from '../devices/shelly1';
import { RxMqttClient } from 'oropel';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
(async function () {
  const ventilador = new Shelly1({
    host: '192.168.31.130',
  });

  const mqttClient = new RxMqttClient('mqtt://localhost:1883');

  const ventiladorTopics = mqttClient.topic('shellies/shelly1-2C79FF/relay/0');
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

  let cont = 0;
  const onObserver = ventilador.observe('relays.0.ison');

  const sub = onObserver.subscribe(
    (ison: boolean) => {
      cont++;
      console.log(`---------${cont}--------`, ison);
    },
    (err) => console.log('Toma error!', err),
  );

  await delay(5000);
  //sub.unsubscribe();

  // const otro = ventilador.observe('relays.0.ison');
  // otro.subscribe(
  //   (ison: boolean) => {
  //     cont++;
  //     console.log(`=========${cont}--------`, ison);
  //   },
  //   (err) => console.log('Toma error!', err),
  // );
})();
