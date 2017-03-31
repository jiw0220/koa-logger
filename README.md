# koa-logger

[![Build Status][build-badge]][build-url]
[![Coverage Status][coverage-badge]][coverage-url]
[![Dependency Status][dependency-badge]][dependency-url]
[![Known Vulnerabilities][vulnerability-badge]][vulnerability-url]
[![Google - JavaScript Style Guide][style-badge]][style-url]

[build-badge]: https://travis-ci.org/BurnerDev/koa-logger.svg?branch=master
[build-url]: https://travis-ci.org/BurnerDev/koa-logger
[coverage-badge]: https://img.shields.io/codecov/c/github/BurnerDev/koa-logger.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/BurnerDev/koa-logger?branch=master
[dependency-badge]: https://david-dm.org/BurnerDev/koa-logger.svg
[dependency-url]: https://david-dm.org/BurnerDev/koa-logger.svg
[vulnerability-badge]: https://snyk.io/test/github/BurnerDev/koa-logger/badge.svg
[vulnerability-url]: https://snyk.io/test/github/BurnerDev/koa-logger
[style-badge]: https://img.shields.io/badge/code%20style-google-brightgreen.svg?style=flat-square
[style-url]: https://google.github.io/styleguide/jsguide.html

Development style logger middleware for [koa](https://github.com/koajs/koa).

```sh
<-- GET /
--> GET / 200 835ms 746b
<-- GET /
--> GET / 200 960ms 1.9kb
<-- GET /users
--> GET /users 200 357ms 922b
<-- GET /users?page=2
--> GET /users?page=2 200 466ms 4.66kb
```

## Example

```js
const logger = require('koa-logger')
const Koa = require('koa')

const app = new Koa()
app.use(logger())
```
