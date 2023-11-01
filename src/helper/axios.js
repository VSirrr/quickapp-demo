;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory(require('@system.fetch')))
    : typeof define === 'function' && define.amd
    ? define(['@system.fetch'], factory)
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      (global.pluginQaRequest = factory(global.fetch)))
})(this, function (fetch) {
  'use strict'

  function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : { default: e }
  }

  var fetch__default = /*#__PURE__*/ _interopDefaultLegacy(fetch)

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object)

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object)
      enumerableOnly &&
        (symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable
        })),
        keys.push.apply(keys, symbols)
    }

    return keys
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {}
      i % 2
        ? ownKeys(Object(source), !0).forEach(function (key) {
            _defineProperty(target, key, source[key])
          })
        : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(
            target,
            Object.getOwnPropertyDescriptors(source)
          )
        : ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(
              target,
              key,
              Object.getOwnPropertyDescriptor(source, key)
            )
          })
    }

    return target
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      })
    } else {
      obj[key] = value
    }

    return obj
  }

  function absoluteUrl(url) {
    if (
      url &&
      (url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('//'))
    ) {
      return true
    }

    return false
  }

  function isUndef(val) {
    return val == null
  }

  function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]'
  }

  function callHook(hook, data) {
    if ('function' === typeof hook) {
      hook(data)
    }
  }
  function merge(requestParams, defaults) {
    Object.keys(defaults).forEach(function (key) {
      if (isUndef(requestParams[key])) {
        requestParams[key] = defaults[key]
      } else if (
        isObject(requestParams.headers) &&
        isObject(defaults.headers)
      ) {
        requestParams.headers = _objectSpread2(
          _objectSpread2({}, defaults.headers),
          requestParams.headers
        )
      }
    })

    if (!absoluteUrl(requestParams.url)) {
      requestParams.url = requestParams.baseURL + requestParams.url
    }
  }
  function needRetry(requestParams, response) {
    if (
      (typeof requestParams.retryCount === 'number' &&
        requestParams.retryCount <= 0) ||
      !requestParams.retryFilter
    ) {
      return false
    }

    return requestParams.retryFilter(response)
  }

  request.defaults = {
    baseURL: '',
    timeout: 10000,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    retryCount: 0,
    retryFilter: function retryFilter(_ref) {
      var code = _ref.code
      return code !== 404
    },
  }

  function request(requestParams) {
    merge(requestParams, request.defaults)
    callHook(requestParams['beforeRequest'], requestParams)
    return Promise.race([
      requestHandler(requestParams),
      timeoutHandler(requestParams.timeout),
    ])
  }

  function requestHandler(requestParams) {
    return new Promise(function (resolve, reject) {
      callHook(requestParams['startRequest'], requestParams)
      fetch__default['default'].fetch({
        url: requestParams.url,
        data: requestParams.data,
        method: requestParams.method,
        header: requestParams.headers,
        responseType: requestParams.responseType,
        success: function success(response) {
          callHook(requestParams['afterRequest'], response)

          if (response.code == 200) {
            if (response.data && response.data.status == 1) {
              callHook(requestParams['responseSuccess'], response)
              resolve(response.data.data)
            } else {
              if (needRetry(requestParams, response)) {
                requestParams.retryCount--
                requestHandler(requestParams)
              } else {
                callHook(requestParams['responseError'], response)
                reject(response)
              }
            }
          } else {
            if (needRetry(requestParams, response)) {
              requestParams.retryCount--
              requestHandler(requestParams)
            } else {
              callHook(requestParams['requestFail'], response)
              reject(response)
            }
          }
        },
        fail: function fail(data, code) {
          callHook(requestParams['requestFail'], {
            data: data,
            code: code,
          })
          reject({
            data: data,
            code: code,
          })
        },
        complete: function complete() {
          callHook(requestParams['finished'], null)
        },
      })
    })
  }

  function timeoutHandler(timeout) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject('网络超时！')
      }, timeout)
    })
  }

  function index() {
    return {
      name: 'request',
      resolve: function resolve() {
        return request
      },
    }
  }

  return index
})
