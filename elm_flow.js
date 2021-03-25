import { elm, mt } from './axios_.js'
import knx from './knex_.js'
import dayjs from 'dayjs'
import schedule from 'node-schedule'
import flatten from 'flatten'

async function main(retry) {
  try {
    let elm_shops = await knx('ele_info_manage').where({ status: 0 })
    let data = await Promise.all(
      elm_shops.map(async ({ shop_id, ks_id }) =>
        elm.get(
          'zelda/CampaignNaposService/pageQuerySubCampaignWithApply?currentPage=1&pageSize=10&applyStatusSet=%5B%22APPROVED%22%5D',
          {
            params: { ksid: ks_id, operatorId: shop_id }
          }
        )
      )
    )

    data = data.map(res =>
      res.entityList.map(entity => {
        let dto = entity?.applyShopDtoResult || entity?.applySkuDtoResult
        return dto?.entityList.map(({ shopId, playTypeDesc, activityStatus, playDescriptionList }) => ({
          shop_id: shopId,
          title: playTypeDesc,
          descs: activityStatus.name,
          activity_id: entity.subCampaign.id,
          rule: playDescriptionList.join('\n'),
          date: `${entity.subCampaign.beginDate} 至 ${entity.subCampaign.endDate}`
        }))
      })
    )

    data = flatten(data).filter(v => v != null)
    
    if(data.length < 50) return Promise.reject()
    const updates = await knx('ele_activity_full_reduction').insert(data)
    console.log(data.length, updates, dayjs().format('YYYY-MM-DD'))
    return
  } catch (e) {
    console.log('error: ', e)
    if (retry < 10) main(retry + 1)
  }
}

// main(0)

let j = schedule.scheduleJob('0 5 * * *', async function (fireDate) {
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date())
  await main(0)
})
