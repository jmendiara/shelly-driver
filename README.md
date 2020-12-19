
# node-typescript-boilerplate

👩🏻‍💻 Developer Ready: A comprehensive template. Works out of the box for most nodejs projects.

🏃🏽 Instant Value: All basic tools included and configured:

- TypeScript 4.2
- eslint with some initial rules recommendation
- jest for fast unit testing and code coverage
- Type definitions for Node.js and Jest
- prettier to enforce consistent code style
- NPM scripts for common operations
- Simple example of TypeScript code and unit test
- .editorconfig for consistent file format
- Example configuration for GitHub Actions

🤲 Free as in speech: available under the APLv2 license.

## Getting Started

This project is intended to be used with the latest Active LTS release of nodejs.

### Use as a repository template

To start, just click the **Use template** link (or the green button). Now start adding your code in the `src` and unit tests in the `__tests__` directories.

## Development setup

To clone the repository use the following commands:

```sh
git clone https://github.com/jmendiara/node-typescript-boilerplate && cd node-typescript-boilerplate
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
