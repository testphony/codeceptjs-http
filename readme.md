# codeceptjs-http

codeceptjs-http is [CodeceptJS](https://codecept.io/) helper which wraps [then-request](https://www.npmjs.com/package/then-request) library to
process HTTP requests. It's alternative helper that provides more flexible request management.

NPM package: https://www.npmjs.com/package/codeceptjs-http

### Configuration

This helper should be configured in codecept.json/codecept.conf.js

-   `endpoint`: base HTTP url.

Example:

```json
{
   "helpers": {
     "HTTP" : {
       "require": "codeceptjs-http",
       "endpoint": "http://localhost:8080"
     }
   }
}
```

## sendRequest

Send HTTP request, response will be availible as return value and in this.currentResponse.

```js
I.sendRequest(('/callback', 'POST', {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    json: {
                      myParam: 123
                    },
                  })); // will use base endpoint
I.sendRequest('https://logalhost:8080/getOrders', 'GET'); // will use url from 1st argument
```

**Parameters**

-   `requestPath` - endpoint path. Can be relative or absolute
-   `method` - (optional) request method. Default 'GET'
-   `options` - (optional) headers, body, etc. see https://www.npmjs.com/package/then-request
-   `domain` - (optional) change domain for request

## seeHttpResponseHasValidJsonSchema

Validate that latest https response has specified JSON schema.

```js
I.seeHttpResponseHasValidJsonSchema('api/getOrders.json');
I.seeHttpResponseHasValidJsonSchema('filters/values.js', ['param1', 'param2']);
```

**Parameters**

-   `schema` - path to JSON schema file. is relative to schemas folder. schemas folder will be in codeceptJS root folder (path.join(global.codecept_dir, './schemas/'))
-   `params` - (optional) if schema file is js file, that export function, then you can specify here params in array, that will be applied to this function. Function should return JSON schema.
-   `data` - (optional) specify data that should be validated. By default first response message for latest request

