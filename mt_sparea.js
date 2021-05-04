import { mt } from './axios_.js'
import knx from './knex_.js'

export async function mt_spareas(wmpoiid) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    let res = await mt.get(
      'https://waimaie.meituan.com/gw/api/logistics/spAreas/new?ignoreSetRouterProxy=true',
      {
        headers: { cookie }
      }
    )
    return Promise.resolve(res)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function test() {
  try {
    // console.log(await mt_spus(10085676, { opType: 8, tagId: 178984089 }))
    console.log('%o', await mt_spareas(10085676))
  } catch (error) {
    console.error(error)
  }
}

// test()
