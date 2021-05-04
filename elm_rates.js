import { elm, mt } from './axios_.js'
import knx from './knex_.js'
import dayjs from 'dayjs'
import schedule from 'node-schedule'
import flatten from 'flatten'

function random(length = 32) {
  // Declare all characters
  let chars = 'ABCDEF0123456789'

  // Pick characers randomly
  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return str
}

export async function elm_bad_rates(startTime, endTime, shopId, ksid) {
  try {
    let shops = await elm.post(
      'https://app-api.shop.ele.me/shop/invoke/?method=relationShop.queryChildShops',
      {
        id: `${random()}|${+dayjs()}`,
        metas: { appName: 'melody', appVersion: '4.4.0', ksid },
        service: 'relationShop',
        method: 'queryChildShops',
        params: {
          query: {
            fuzzy: '',
            layerLimit: 100,
            parentIds: [shopId],
            returnType: 'LEAFS',
            systemType: 'CHAIN'
          }
        },
        ncp: '2.0.0'
      },
      {
        headers: {
          'x-shard': `shopid=${shopId}`,
          origin: 'https://melody-comment.faas.ele.me',
          referer: 'https://melody-comment.faas.ele.me/'
        }
      }
    )

    // console.log(shops.result.length)

    let data = await elm.post(
      'https://app-api.shop.ele.me/ugc/invoke/?method=ShopRatingService.getRateResult',
      {
        id: `${random()}|${+dayjs()}`,
        metas: { appName: 'melody', appVersion: '4.4.0', ksid },
        service: 'ShopRatingService',
        method: 'getRateResult',
        params: {
          rateQuery: {
            shopIds: shops.result.map(shop => shop.id),
            startTime, // : '2021-04-27T00:00:00',
            endTime, //: '2021-04-27T23:59:59',
            isReplied: null,
            rateType: 'BAD_REVIEW',
            rateContentType: 'ALL',
            rateSourceType: 'ELEME',
            currentPage: 1,
            offset: 0,
            limit: 200
          }
        },
        ncp: '2.0.0'
      },
      {
        headers: {
          'x-shard': `shopid=${shopId}`,
          origin: 'https://melody-comment.faas.ele.me',
          referer: 'https://melody-comment.faas.ele.me/'
        }
      }
    )

    if (data.error != null) return Promise.reject(data)
    return Promise.resolve(data.result?.rateInfos)
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function elm_order_by_rateId(shopId, evaluateId, ksid) {
  try {
    let data = await elm.post(
      'https://app-api.shop.ele.me/shop/invoke/?method=EvaluateIMService.createSessionByEvaluateId',
      {
        service: 'EvaluateIMService',
        method: 'createSessionByEvaluateId',
        params: {
          evaluateId
        },
        id: `${random()}|${+dayjs()}`,
        metas: {
          appVersion: '1.0.0',
          appName: 'melody',
          ksid,
          shopId
        },
        ncp: '2.0.0'
      }
    )

    if (data.error != null) return Promise.reject(data)

    let orderId = new URL(
      JSON.parse(new URL(data.result).searchParams.get('cardJson')).template_text.schemaUrl
    ).searchParams.get('order_id')

    return Promise.resolve(orderId)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function test() {
  try {
    let bad_rates = await elm_bad_rates(
      dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      dayjs().startOf('day').format('YYYY-MM-DDT23:59:59')
    )

    let { shopId } = bad_rates[0]
    let { rateId } = bad_rates[0].orderRateInfos[0]

    let session = await elm_order_by_rateId(shopId, rateId)
    // session = decodeURIComponent(session)
    let orderId = (session = new URL(
      JSON.parse(new URL(session).searchParams.get('cardJson')).template_text.schemaUrl
    ).searchParams.get('order_id'))
    // session = JSON.parse(session)
    console.log(orderId)
  } catch (error) {
    console.error(error)
  }
}

// test()
