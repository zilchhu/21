import axios from 'axios'
import qs from 'qs'

let mtCfg = {
  baseURL: 'https://waimaieapp.meituan.com/',
  responseType: 'json',
  timeout: 5000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    Connection: 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    Host: 'waimaieapp.meituan.com',
    Origin: 'https://waimaieapp.meituan.com',
    cookie: '',
    // Referer: 'https://waimaieapp.meituan.com/igate/wmactpc/activity/list?wmPoiId=2924399&type=100',
    'sec-ch-ua': '"Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
    'sec-ch-ua-mobile': '?0',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest'
  }
}

let elmCfg = {
  baseURL: 'https://httpizza.ele.me/',
  responseType: 'json',
  timeout: 5000,
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh-CN,zh;q=0.9',
    cookie:
      'ubt_ssid=jjejf45i3g21gq7u9q0qsx7285p26no9_2020-07-23; cna=mN6fF0ZBfUoCAbcM883H0GeQ; _ga=GA1.2.1935531342.1595506439; perf_ssid=k8hpmuq7iwcmfh1w8uk3hlndqmjcbq5n_2020-07-24; ut_ubt_ssid=aw4uycga06hsyjzob32dq8a4qx2e3lsy_2020-08-02; UTUSER=0; NEW_PC=1; ksid=OTA3YJMTA1MjUzOTA0OTU1MTAxTlhJSldrazJQ; shopId=500828380; xlly_s=1; isg=BHh4l27ubJoDqr9W917y8XMrSSYK4dxrv6RabLLpErNmzRu3W_Fu-t6shcX9nZRD; l=eB_OlV6eOjYt6yMZBO5wnurza77tUIRf1sPzaNbMiInca6ZlOFgTHNCQGMH25dtjgt5AMeKyJvGCeR3BJ4z38AkDBeYB8ZBzJF96Je1..; tfstk=cGEfBOchPIAf1q_w0-6ybaRMMyoOZ1vICZG0hyt_YtVRVr2fiGtEOxE4SCK-JY1..',
    origin: 'https://ele-melody-merchant.faas.ele.me',
    referer: 'https://ele-melody-merchant.faas.ele.me/',
    'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
    'x-eleme-requestid': 'AE1FCBF314F24D09ABD5F696967EFF46|1614933408225'
  }
}

const namespace = 'axios-retry'

export const mt = axios.create(mtCfg)

mt.interceptors.request.use(
  config => {
    config[namespace] = config[namespace] || {}
    config[namespace].data = config.data
    config[namespace].retryCount = config[namespace].retryCount || 0

    config.data = qs.stringify(config.data)
    // console.log(config)
    return config
  },
  err => Promise.reject(err)
)

mt.interceptors.response.use(
  res => {
    if (res.data.code === 0) {
      // console.log(0)
      return res.data.data == '' || res.data.data == null ? res.data : res.data.data
    } else {
      // console.log(1)
      return Promise.reject(res.data)
    }
  },
  error => {
    const config = error.config

    if (!config || !config[namespace]) {
      return Promise.reject(error)
    }

    const shouldRetry =
      (/ETIMEDOUT|ECONNRESET|ECONNABORTED/.test(error.code) || error.msg == '服务器超时，请稍后再试') &&
      config[namespace].retryCount < 10

    if (shouldRetry) {
      config[namespace].retryCount += 1

      console.log('retry...', config[namespace].retryCount)
      return new Promise(resolve => setTimeout(() => resolve(mt({ ...config, data: config[namespace].data })), 600))
    }

    return Promise.reject(error)
  }
)

export const elm = axios.create(elmCfg)

elm.interceptors.request.use(
  config => {
    config[namespace] = config[namespace] || {}
    config[namespace].data = config.data
    config[namespace].retryCount = config[namespace].retryCount || 0
    // console.log(config.data.params)
    // config.data = qs.stringify(config.data)
    return config
  },
  err => Promise.reject(err)
)

elm.interceptors.response.use(
  res => {
    return Promise.resolve(res.data)
  },
  error => {
    const config = error.config

    if (!config || !config[namespace]) {
      return Promise.reject(error)
    }

    const shouldRetry =
      (/ETIMEDOUT|ECONNRESET|ECONNABORTED/.test(error.code) || error.msg == '服务器超时，请稍后再试') &&
      config[namespace].retryCount < 10

    if (shouldRetry) {
      config[namespace].retryCount += 1

      console.log('retry...', config[namespace].retryCount)
      return new Promise(resolve => setTimeout(() => resolve(elm({ ...config, data: config[namespace].data })), 600))
    }

    return Promise.reject(error)
  }
)
