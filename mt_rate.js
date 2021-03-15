import { mt } from './axios_.js'
import knx from './knex_.js'
import dayjs from 'dayjs'
import schedule from 'node-schedule'

async function main(retry) {
  try {
    let mt_shops = await knx('foxx_shop_reptile').where({ status: 0 })
    let data = await Promise.all(
      mt_shops.map(async ({ cookie }) =>
        mt.get('v2/index/r/businessOverview?ignoreSetRouterProxy=true', { headers: { cookie } })
      )
    )
    data = mt_shops.map(({ wmpoiid }, i) => ({ wmpoiid, ...data[i], created_at: dayjs().format('YYYY-MM-DD') }))

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
    if(retry < 10)  main(retry + 1)
  }
}

// main(0)

let j = schedule.scheduleJob('0 2 * * *', async function (fireDate) {
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date())
  await main(0)
})
