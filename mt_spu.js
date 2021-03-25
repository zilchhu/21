import { mt } from './axios_.js'
import knx from './knex_.js'

/**
 *
 * @param {opType} opType 全部-0, 售卖中-1, 已售罄-3, 已下架-2, 折扣-8, 买赠-7
 */
export async function mt_spus(wmpoiid, { opType, tagId }) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    let { productList } = await mt.get(
      'reuse/product/food/r/spuList?pageNum=1&pageSize=300&needAllCount=true&needTagList=true',
      {
        headers: { cookie },
        params: { wmPoiId: wmpoiid, opType, queryCount: opType, tagId }
      }
    )
    return Promise.resolve(productList)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function test() {
  try {
    // console.log(await mt_spus(10085676, { opType: 8, tagId: 178984089 }))
    console.log((await mt_spus(10085676, { opType: 2 })).length)
  } catch (error) {
    console.error(error)
  }
}

// test()
