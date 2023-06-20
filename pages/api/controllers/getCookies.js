import puppeteer from 'puppeteer';

async function saveCookies(sessionName, proxy) {
  const browser = await puppeteer.launch( {headless: false, args: [ `--proxy-server=${proxy.ip}:${proxy.port}` ]});
  const page = await browser.newPage();

  await page.goto('https://www.chequelegal.com.br');

  const bt = await page.$x('/html/body/table/tbody/tr[1]/td[4]');
  await bt[0].click();

  const cookies = await page.cookies();
  const fs = require('fs');
  fs.writeFileSync('./public/cookies/'+sessionName+'.json', JSON.stringify(cookies));
  await browser.close();
  return cookies
}

export default saveCookies