import { mt } from './axios_.js'
import knx from './knex_.js'
import dayjs from 'dayjs'

/**
 *
 * @param {type} type 集点返券-98, 下单返券-100, 店内领券-103
 * @param {status}  status 进行中-1, 待生效-0, 已结束-2,4,11, 已冻结-5,6,7
 */
export async function mt_acts_by_type(wmpoiid, type, { status } = {}) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    let { list } = await mt.get('reuse/activity/query/list?startTime=&endTime=&effect=false&pageNum=1&pageSize=200', {
      headers: { cookie },
      params: { wmPoiId: wmpoiid, type, status }
    })
    return Promise.resolve(list)
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function mt_acts_disable_b_w(wmpoiid, type, wmPoiIdAndActIds) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    let res = await mt.post(
      'reuse/activity/marketing/commodity/batchActivityDisable',
      {
        wmPoiId: wmpoiid,
        type,
        wmPoiIdAndActIds: JSON.stringify(wmPoiIdAndActIds) //: [{"wmPoiId":2924399,"actId":215906939}]
      },
      {
        headers: { cookie }
      }
    )
    return Promise.resolve(res)
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function mt_acts_disable_n_w(wmpoiid, type, activityId) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    let res = await mt.post(
      'reuse/activity/act/marketing/w/disableNew',
      {
        wmPoiId: wmpoiid,
        type,
        activityId
      },
      {
        headers: { cookie }
      }
    )
    return Promise.resolve(res)
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function mt_acts_create_100_w(
  wmpoiid,
  activeName,
  limitPrice,
  couponPrice,
  fullPrice,
  { validityDay, totalCount, beginTime, endTime } = {
    validityDay: 15,
    totalCount: 3000,
    beginTime: dayjs().format('YYYY-MM-DD'),
    endTime: dayjs().add(360, 'day').format('YYYY-MM-DD')
  }
) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    let res = await mt.post(
      'reuse/activity/marketing/e/v2/campaign/shopActivity/w/create',
      {
        type: 0,
        wmPoiId: wmpoiid,
        isAgree: 1,
        beginTime,
        endTime,
        validityDay,
        limitPrice,
        couponPrice,
        totalCount,
        fullPrice,
        activeName // : '下单返券'
      },
      {
        headers: { cookie }
      }
    )
    return Promise.resolve(res)
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function mt_acts_create_103_w(
  wmpoiid,
  couponInfo,
  { beginTime, endTime, weeksTime, period } = {
    beginTime: dayjs().startOf('day').unix(),
    endTime: dayjs().startOf('day').add(90, 'day').unix(),
    weeksTime: '1,2,3,4,5,6,7',
    period: '00:00-23:59'
  }
) {
  try {
    let { cookie } = await knx('foxx_shop_reptile').where({ status: 0, wmpoiid }).first()
    let res = await mt.post(
      'reuse/activity/marketing/w/common/create',
      {
        wmActPoiId: null,
        type: 5,
        wmPoiId: wmpoiid,
        isAgree: 1,
        beginTime,
        endTime,
        weeksTime,
        period,
        couponInfo: JSON.stringify(couponInfo),
        couponType: null // : [{"limitPrice":30,"price":4,"stock":3000,"valityDays":"7","customType":2,"limitCount":0,"limitDayCount":0}]
      },
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
    // console.log('%o', await mt_acts_by_type(2924399, 103, { status: 1 }))
    // console.log('%o', await mt_acts_disable_n_w(2924399, 103, 239793171))
    console.log(
      '%o',
      await mt_acts_create_103_w(9576153, [
        { limitPrice: '39', price: '4', stock: '3000', valityDays: '7', customType: 2, limitCount: 0, limitDayCount: 0 }
      ])
    )
    // console.log()
  } catch (error) {
    console.error(error)
  }
}

// test()
