const Koa = require('koa'),
      app = new Koa(),
      url = require('url'),
      cheerio = require('cheerio'),
      crypto = require('crypto'),
      https = require('https');

function getData() {
  var thisu = url.parse('https://cors.zme.ink/https://t.me/s/V2List', true)
  var options = {
      hostname: thisu.host,
      method: 'GET',
      path: thisu.path,
      headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 4.0.3; U9200 Build/HuaweiU9200)",
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
  };
  return new Promise(async (resolve, reject) => {
      var req = https.request(options, function (res) {
          // console.log('STATUS: ' + res.statusCode);
          // console.log('HEADERS: ' + JSON.stringify(res.headers));
          var data = '';
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
              // console.log('BODY: ' + chunk);
              data += chunk;
          });
          res.on('end', function () {
              resolve(data);
          });
      });

      req.on('error', function (e) {
          console.log('problem with request: ' + e.message);
      });

      // write data to request body
      req.end();
  });
}

function makeData(data) {
  const $ = cheerio.load(data)
  const $ls = $('body.widget_frame_base').children('main.tgme_main').children('div.tgme_container').children('section.tgme_channel_history').children('div.tgme_widget_message_wrap')
  const count  = $ls.length - 1
  // console.log(count)
  let d = $($ls).eq(count).find('div.tgme_widget_message_text').text()
  if(d.includes('节点精选')) {d = d.substring(0, d.lastIndexOf('节点精选') -2)}
  // d = Buffer.from(d).toString('base64')
  d = d.split('vmess://')
  for( i in d) {
    // d[i] = 'vmess://' + d[i]
    d[i] = Buffer.from(d[i], 'base64').toString('utf8')
    d[i] = d[i].replace(/翻墙党fanqiangdang.com/g, 'whaaat免费节点' + i)
    d[i] = d[i].replace(/@jdgxq  节点共享群TG电报搜索/g, 'whaaat免费节点' + i)
    d[i] = d[i].replace(/节点共享群TG电报搜 @jdgxq/g, 'whaaat免费节点' + i)
    d[i] = Buffer.from(d[i]).toString('base64')
    d[i] = 'vmess://' + d[i]
  }
  d = d.filter((x, i) => i !== 0)
  d = d.join('\r')
  d = Buffer.from(d).toString('base64')
  return d
}

app.use(async (ctx, next) => {
  let data = await getData()
  await next()
  ctx.response.body = makeData(data)
})

app.listen(5500);
console.log('app started at port 5200...');