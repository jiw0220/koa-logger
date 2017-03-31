const bytes = require('bytes');
const chalk = require('chalk');
const Counter = require('passthrough-counter');
const humanize = require('humanize-number');

/**
 * TTY check for dev format.
 */
const isatty = process.stdout.isTTY;

/**
 * Color map.
 */
const colorCodes = {
  5: 'red',
  4: 'yellow',
  3: 'cyan',
  2: 'green',
  1: 'green',
  0: 'yellow',
};

/**
 * Log helper.
 * @param {obj} ctx
 * @param {date} start
 * @param {string} len
 * @param {obj} err
 * @param {obj} event
 */
function log(ctx, start, len, err, event) {
  // get the status code of the response
  const status = err ? (err.status || 500) : (ctx.status || 404);

  // set the color of the status code;
  const s = status / 100 | 0;
  const color = colorCodes[s];

  // get the human readable response length
  let length;
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (null == len) {
    length = '-';
  } else {
    length = bytes(len);
  }

  const upstream = err ? chalk.red('xxx')
    : event === 'close' ? chalk.yellow('-x-')
    : chalk.gray('-->');

  console.log('  ' + upstream
    + ' ' + chalk.bold('%s')
    + ' ' + chalk.gray('%s')
    + ' ' + chalk[color]('%s')
    + ' ' + chalk.gray('%s')
    + ' ' + chalk.gray('%s'),
      ctx.method,
      ctx.originalUrl,
      status,
      time(start),
      length);
}

/**
 * Show the response time in a human readable format.
 * @param {date} start
 * @return {string}
 */
function time(start) {
  const delta = new Date - start;
  return humanize(delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's');
}

/**
 * Development logger middleware attachment
 * @param {obj} opts
 * @return {fn}
 */
function koaLogger(opts) {
  return async function logger(ctx, next) {
    // if not tty exit early
    if(!isatty) {
      return next();
    }

    // request
    const start = new Date;
    console.log(
      '  ' + chalk.gray('<--')
      + ' ' + chalk.bold('%s')
      + ' ' + chalk.gray('%s'),
      ctx.method,
      ctx.originalUrl);

    await next();

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    const length = ctx.response.length;
    const body = ctx.body;
    let counter;
    if (null == length && body && body.readable) {
      ctx.body = body
        .pipe(counter = new Counter())
        .on('error', ctx.onerror);
    }

    const res = ctx.res;
    const onfinish = done.bind(null, 'finish');
    const onclose = done.bind(null, 'close');

    res.once('finish', onfinish);
    res.once('close', onclose);

    /**
     * fire another log entry when response is closing
     * @param {obj} event
     */
    function done(event) {
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      log(ctx, start, counter ? counter.length : length, null, event);
    }
  };
}

module.exports = koaLogger;
