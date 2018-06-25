
const request = require('then-request');
const urljoin = require('url-join');
const { cropLongData } = require('@kronoslive/codeceptjs-utils');
const { FormData } = require('then-request');

let mochawesome;
let utils;

/**
 * HTTP codeceptjs helper
 */
class HTTP extends Helper {
  /**
   *
   * @param {object} config
   */
  constructor(config) {
    super(config);
    this._validateConfig(config);
  }

  /**
   *
   * @param {object} config
   * @private
   */
  _validateConfig(config) {
    this.options = {};

    this.currentResponse = '';

    // Override defaults with config
    Object.assign(this.options, config);

    if (!this.options.endpoint) {
      throw new Error(`
        HTTP requires at endpoint to be set.
        Check your codeceptjs config file to ensure this is set properly
          {
            "helpers": {
              "HTTP": {
                "endpoint": "YOUR_HTTP_ENDPOINT"
              }
            }
          }
        `);
    }
  }

  /**
   *
   * @returns {boolean}
   * @private
   */
  _beforeSuite(test, mochawesomeHelper) {
    mochawesome = mochawesomeHelper || this.helpers.Mochawesome;
    utils = this.helpers.Utils;
    return true;
  }

  /**
   *
   * @private
   */
  _after() {
    this.currentResponse = '';
  }

  /**
   * Send HTTP request, response will be availible as return value and in this.currentResponse.
   * @param {string} requestPath - endpoint path. Can be relative or absolute
   * @param {string} method - (optional). Default GET
   * @param {object} options - (optional). Headers, body, etc. see https://www.npmjs.com/package/then-request
   * @param {string} domain
   * @returns {*}
   *
   * ```js
   * let response = yield I.sendRequest('/orders');
   * ```
   */
  async sendRequest(requestPath, method = 'GET', options = {}, domain) {
    domain = domain || this.options.endpoint;

    if (requestPath.indexOf('http') !== 0) {
      requestPath = urljoin(domain, requestPath);
    }

    let form;

    if (options.form) {
      form = new FormData();
      Object.keys(options.form).forEach((k) => {
        form.append(k, options.form[k].toString());
      });
    }

    mochawesome.addMochawesomeContext({
      title: 'Send HTTP request',
      value: {
        method,
        url: requestPath,
        options,
      },
    });

    const res = await request(method, requestPath, { ...options, form });

    let body = res.body.length === 0 ? null : res.body.toString('utf8');
    try {
      body = JSON.parse(body);
    } catch (e) {
      // ignore then
    }

    const result = {
      status: res.statusCode,
      headers: res.headers,
      body,
    };

    this.currentResponse = result;
    mochawesome.addMochawesomeContext({
      title: 'Get HTTP response',
      value: cropLongData(result),
    });

    return result;
  }

  /**
   * Validate that latest https response has specified JSON schema.
   * @param {string} schema - path to JSON schema file. is relative to schemas folder
   * @param {*} params
   * @param {*} data - (optional) - specify data that should be validated (by default first response message for latest
   *     request)
   * @returns {*}
   *
   * ```
   * I.seeHttpResponseHasValidJsonSchema('authPassed.json');
   * ```
   */
  seeHttpResponseHasValidJsonSchema(schema, params, data) {
    data = data || this.currentResponse.body;
    return utils.seeDataHasValidJsonSchema(schema, params, data);
  }
}

module.exports = HTTP;
