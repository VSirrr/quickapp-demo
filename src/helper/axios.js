import $fetch from '@system.fetch'

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
    } else if (isObject(requestParams.headers) && isObject(defaults.headers)) {
      requestParams.headers = Object.assign(
        {},
        defaults.headers,
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
    $fetch.fetch({
      url: requestParams.url,
      data: requestParams.data,
      method: requestParams.method,
      header: requestParams.headers,
      responseType: requestParams.responseType,
      success: function success(response) {
        callHook(requestParams['afterRequest'], response)

        if (response.code == 200) {
          if (response.data) {
            callHook(requestParams['responseSuccess'], response)
            resolve(response.data)
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

export default request
