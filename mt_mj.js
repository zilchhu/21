import { mt } from './axios_.js'
import knx from './knex_.js'
import dayjs from 'dayjs'
import schedule from 'node-schedule'

async function main() {
  try {
    let mt_shops = await knx('foxx_shop_reptile').where({ status: 0 })
    let data = await Promise.all(
      mt_shops.map(async ({ cookie, wmpoiid }) =>
        mt.get('reuse/activity/query/list', {
          headers: { cookie },
          params: { type: 2, wmPoiId: wmpoiid, status: 1, effect: false, pageNum: 1, pageSize: 200 }
        })
      )
    )
    data = mt_shops.
      
      map(({ wmpoiid }, i) => ({ wmpoiid, ...data[i].list[0], created_at: dayjs().format('YYYY-MM-DD') }))

    const exists = await knx.schema.hasTable('test_mt_rates_')
    if (!exists) {
      await knx.schema.createTable('test_mt_rates_', table => {
        table.bigInteger('wmpoiid').notNullable()
        table.integer('totalTurnover')
        table.integer('validOrderCount')
        table.string('evaluatingStr')
        table.string('scoringRules')
        table.string('scoreUtime')
        table.integer('yesterdayPoiScore')
        table.string('merchantRatingStr')
        table.integer('yesValidOrderCount')
        table.integer('yesTotalTurnover')
        table.boolean('isShowPoiScore')
        table.integer('todayPoiScore')
        table.date('created_at')
        table.primary(['wmpoiid', 'created_at'])
      })
    }
    const updates = await knx('test_mt_rates_').insert(data).onConflict(['wmpoiid', 'created_at']).merge()
    console.log(data.length, updates, dayjs().format('YYYY-MM-DD'))
    return
  } catch (e) {
    console.log('error: ', e)
    main()
  }
}

// main()

let j = schedule.scheduleJob('0 2 * * *', async function (fireDate) {
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date())
  await main()
})
