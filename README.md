
# shelly-driver

> CURRENTLY UNDER ACTIVE DEVELOPMENT

Javascript driver to connect and manage shelly devices

- [x] HTTP communication
- [x] CoIoT/MQTT/HTTP status tracking
- [x] mDNS Device Discovery

## Getting Started

```sh
npm i shelly-driver
```

```ts
// Direct device access
import { Shelly1 } from 'shelly-driver';

const fan = new Shelly1({
  host: '192.168.31.130',
});

// lazy observation on any status property change via RxJS
fan.observe('relays.0.ison')
  .subscribe((isOn) => console.log('The device is turned', isOn ? 'on': 'off'));

const settings = await fan.setRelay({ turn: 'on' });
```

## Devices supported

We are in the way of supporting all the Allterco devices. Please open an issue if you need more devices supported. This driver contains full feature self documented code, it's not hard to add them,
but takes some of our free time.

| Device                               | Available | Real life tested |
| ------------------------------------ | --------- | ---------------- |
| Shelly1                              | ✅         | ✅               |
| Shelly1PM                            | ✅         | ❌               |
| Shelly1 with DS1820/DHT22 add-on     | ✅         | ❌               |
| Shelly1 with low-power switch add-on | ✅         | ❌               |
| Shelly Door Window 1                 | …          | ✅               |
| Shelly Button 1                      | …          | ✅               |

## Development setup

To clone the repository use the following commands:

```sh
git clone https://github.com/jmendiara/shelly-driver && cd shelly-driver
```

Use [VSCode development containers](https://code.visualstudio.com/docs/remote/containers),  directly [docker-compose](https://docs.docker.com/compose/)

```sh
# Shell interactive session inside a container
docker-compose run app bash
```

### Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files,
- `build` - transpile TypeScript to ES6,
- `watch` - interactive watch mode to automatically transpile source files,
- `lint` - lint source files and tests,
- `test` - run tests,
- `test:watch` - interactive watch mode to automatically re-run tests
- `format` - format the code


### Debug

Relevant event log for the driver are available using [debug](https://github.com/visionmedia/debug) module.
```
DEBUG=shelly:* ./your-app-binary
```

## License

Copyright 2020 Javier Mendiara Cañardo

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
