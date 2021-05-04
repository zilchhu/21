import axios from 'axios'
import schedule from 'node-schedule'

async function main() {
  try {
    let res = await axios.post('https://open-api.shop.ele.me/token', 'grant_type=client_credentials', {
      headers: {
        'User-Agent': 'vscode-restclient',
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'open-api.shop.ele.me',
        Authorization: 'Basic QjFYWU1jNnpmRjozOWQ0Y2RjNDc4YzNmMGYzN2QwMDIwMjJjYmVmNWRiNTM2NjY2YTli',
        'accept-encoding': 'gzip, deflate'
      }
    })
    console.log(res.data)
  } catch (e) {
    console.log('error: ', e)
  }
}

// main(0)

let j = schedule.scheduleJob('0 8 * * 0', async function (fireDate) {
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date())
  await main()
})
