import { mt } from './axios_.js'
import knx from './knex_.js'

export async function mt_cats_by_shop(wmpoiid) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    let {
      tagList
    } = await mt.get(
      'reuse/product/food/r/spuList?opType=0&queryCount=0&pageNum=1&pageSize=10&needAllCount=false&needTagList=true',
      { headers: { cookie }, params: { wmPoiId: wmpoiid } }
    )
    return Promise.resolve(tagList)
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function mt_cat_by_id_w(wmpoiid, tagid, { name, description, top_flag, tag_type, time_zone, sequence } = {}) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    return mt.post(
      'reuse/product/food/w/saveTagInfo',
      {
        wmPoiId: wmpoiid,
        tagInfo: JSON.stringify({ id: tagid, name, description, top_flag, tag_type, time_zone, sequence })
      },
      { headers: { cookie } }
    )
  } catch (e) {
    return Promise.reject(e)
  }
}

async function test() {
  try {
    // console.log(await mt_cats_by_shop(10085676))
    console.log(
      await mt_cat_by_id_w(10085676, 221354886, {
        name: '┏ 🌈 ┓新品尝鲜',
        description: '',
        top_flag: 0,
        tag_type: 0,
        time_zone: {
          1: [{ start: '00:00', end: '23:59', time: '00:00-23:59' }],
          2: [{ start: '00:00', end: '23:59', time: '00:00-23:59' }]
        },
        sequence: 3
      })
    )
  } catch (error) {
    console.error(error)
  }
}

// test()
