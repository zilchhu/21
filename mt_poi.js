import { mt } from './axios_.js'
import knx from './knex_.js'

/**
 *
 * @param {isOpen}  isOpen 正常营业-1, 休息中-3, 待营业-10
 */
export async function mt_shops({ isOpen, keyWord, cities } = {}) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0 }).first()
    let {
      dataList
    } = await mt.get('v2/shop/businessStatus/r/poiListSearch?pageNum=1&pageSize=300&ignoreSetRouterProxy=true', {
      headers: { cookie },
      params: { isOpen, keyWord, cities }
    })
    return Promise.resolve(dataList)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function test() {
  try {
    console.log(await mt_shops({ isOpen: 10 }))
  } catch (error) {
    console.error(error)
  }
}

// test()
