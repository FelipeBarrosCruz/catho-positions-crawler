const axios = require('axios').default
const $ = require('cheerio')
const { waterfall } = require('async')

const ALPHABET = 'ABCDEFGHIJLMNOPQRSTVWZ'
const RESULT_LIST = {}

const client = axios.create({
  baseURL: 'https://www.catho.com.br/profissoes/cargo/',
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,fr;q=0.5,ru;q=0.4',
    'Connection': 'keep-alive',
    'Cookie': 'Catho=ff8aa24be77d6d4421ced2645343e811; layoutPadrao=b2c; regionalizacao=br_brasil; ckorigem=cat6; nomeCargoSlug=analista-financeiro; sgtc=1; uuid=1589976951; _hjid=3949ac8c-9bec-40c6-930d-89231a20da33; _ga=GA1.3.746430342.1577977762; _fbp=fb.2.1577977761715.1587266195; _gaexp=GAX1.3.71cId89vReCpwcJ0jYtpBQ.18314.0; _gid=GA1.3.388465148.1579113555; tracking_origem=YTo0OntzOjEwOiJ0cmFja2luZ0lkIjtzOjEwOiIxNTg5OTc2OTUxIjtzOjg6Im9yaWdlbUlkIjtpOjE7czo5OiJ1c3VhcmlvSWQiO2k6MDtzOjk6InRpbWVzdGFtcCI7aToxNTc5MTEzNTgwO30%3D',
    'Host': 'www.catho.com.br',
    'Referer': 'https://www.catho.com.br/profissoes/cargo/a/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36'
  }
})

const getPositionsAreasByLetter = async (letter) => {
  const { data } = await client.get(`${letter}/`)
  const $html = $.load(data)
  const $elements = $html('#containerCargos > ul > li > a')
  const result = []
  $elements.map(($index, $element) => result.push($($element).text()))
  return result
}

const Tasks = ALPHABET.split('').map((letter) => (next) => {
  console.log(`request positions of ${letter}`)
  return getPositionsAreasByLetter(letter)
    .then((result) => {
      RESULT_LIST[letter] = result
      next()
    })
    .catch((err) => {
      console.log(err)
      next(null)
    })
})

waterfall(Tasks, (err) => {
  if (err) {
    return console.log(err)
  }
  require('fs').writeFileSync('list-position-areas-by-catho.json', JSON.stringify(RESULT_LIST, null, 4))
  console.log('done')
})