import puppeteer from 'puppeteer';
import { connection } from '../models/connection';
import getCaptcha from './getCaptcha';
import preload from '../models/preload';
import workers from '../models/workers';
import verified from '../models/verified';
import saveCookies from './getCookies'
import sharp from 'sharp'
import getProxyList from './getProxy';
import cpf from '../models/cpf';
import fs from 'fs'
import { Sequelize, Op } from 'sequelize';


class Worker {

    constructor() {
        this.workerName = ""
        this.proxy = {}
        this.page = {}
        this.CPF = ""
        this.groupid = []
    }

    async getCpf() {
        const Op = Sequelize.Op
        const verify = await verified.findAll()
        const listCpf = verify.length > 0 ? verify.map(e => e.dataValues.cpfreq + '\r') : []
        console.log(listCpf)
        const query = await cpf.findOne({ where: { number: { [Op.notIn]: listCpf } } })

        if (query) {
            const obj = query.toJSON()
            console.log(obj)
            const number = obj.number.replace('\r', '')
            return number
        } else {
            return null
        }


    }

    async getBarCode() {
        try {
            this.data = null;
            await connection.sync();
            const res = await preload.findOne({ where: { [Op.and]: [{ free: true }, { paused: false }, {groupid:{[Op.in]:this.groupid}}]}});

            if (res) {
                const data = res.toJSON()

                if (data) {
                    preload.update({ free: false }, { where: { id: data.id } });
                    this.data = data;
                    this.CPF = data.cpf;
                    return data
                } else {
                    this.data = null
                    return null
                }


            } else {
                this.data = null
                return null
            }
        } catch (erro) {
            console.log(erro)
            this.data = null
            return null
        }

    }

    async handleImage(imagename) {
        const imagePath = './public/' + imagename;
        const scale = 2;
        await sharp(imagePath)
            .metadata()
            .then(metadata => {
                const width = metadata.width * scale;
                const height = metadata.height * scale;
                return sharp(imagePath)
                    .resize(width, height)
                    .grayscale() // Converter para escala de cinza
                    .toFile(`./public/ok_${imagename}`);
            })
            .then(() => {
                console.log('Imagem ampliada criada com sucesso!');
            })
            .catch(err => {
                console.error(err);
            });
        return 'ok_' + imagename;
    }

    async captcha(img) {
        const res = await getCaptcha(img)
        return res.data;
    }

    async cookies() {
        const proxy = await this.setProxy();
        await saveCookies(this.workerName, proxy)
    }

    async setProxy() {
        await this.isBreakTime()
        const res = await getProxyList()
        const change = Math.floor(Math.random() * (res.data.length - 1))

        this.proxy = res.data[change]
        console.log(res.data[change])
        return res.data[change]
    }


    async setInstance(name, groupid) {
        this.workerName = name
        this.groupid = groupid
        try {

            await connection.sync()
            await workers.create({ name: name, status: "Iniciando" })
            return true
        } catch {
            return false
        }
    }

    async isBreakTime(){
        const hour = new Date().getUTCHours() - 3

        if(hour < 4){
            const date = new Date().setHours(4,0,0)
            console.log('Aguardando', date - new Date())
            await new Promise(r => setTimeout(r, date - new Date()));
        }else{
            return false
        }


        
    }

    async start() {

        await this.isBreakTime()
        const verifyInstance = await workers.findOne({ where: { name: this.workerName } })

        if (!verifyInstance) {
            browser.close()
            return
        };
        const instance = verifyInstance.toJSON()
        this.id = instance.id
        const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', args: [
            `--proxy-server=${this.proxy.ip}:${this.proxy.port}`,
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--single-process',
        ], ignoreDefaultArgs: ['--disable-extensions'] });

        const page = await browser.newPage();
        const cookies = fs.readFileSync(`./public/cookies/${this.workerName}.json`, "utf8");

        for (const cookie of JSON.parse(cookies)) {
            await page.setCookie(cookie);
        }

        try {
            await page.goto('https://www.chequelegal.com.br');

            const checkReloadCaptcha = () => null;
            const atualizacaoAutomaticaCaptcha = () => null
            await page.exposeFunction(checkReloadCaptcha.name, checkReloadCaptcha);
            await page.evaluate(() => checkReloadCaptcha());
            await page.exposeFunction(atualizacaoAutomaticaCaptcha.name, atualizacaoAutomaticaCaptcha);
            await page.evaluate(() => atualizacaoAutomaticaCaptcha());

            const barCode = await this.getBarCode();
            if (!barCode) {
                await workers.destroy({ where: { id: this.id } })
                browser.close();
                return
            }
            console.log('barcode', barCode)
            const [a, b, c] = [barCode.number.slice(0, 8), barCode.number.slice(8, 18), barCode.number.slice(18)];
            this.barCode = barCode
            const cpfReq = await this.getCpf()

            await page.waitForXPath('//*[@id="lbCaptcha"]/table/tbody/tr/td[2]')
            const [cap] = await page.$x('//*[@id="lbCaptcha"]/table/tbody/tr/td[2]')

            const imgname = new Date().getMilliseconds() + '.png'
            await cap.screenshot({ path: './public/' + imgname, threshold: 0 })
            const capImage = await this.handleImage(imgname)

            const solvedCapatcha = await getCaptcha(false, capImage)
            console.log(cpfReq)
            await page.$eval('input[name="cpfCnpjEmitente"]', input => input.value = null);
            await page.type('input[name="cpfCnpjEmitente"]', barCode.cpf);

            await page.$eval('input[name="primeiroCampoCmc7"]', input => input.value = null);
            await page.type('input[name="primeiroCampoCmc7"]', a);

            await page.$eval('input[name="segundoCampoCmc7"]', input => input.value = null);
            await page.type('input[name="segundoCampoCmc7"]', b);

            await page.$eval('input[name="terceiroCampoCmc7"]', input => input.value = null);
            await page.type('input[name="terceiroCampoCmc7"]', c);

            await page.$eval('input[name="cpfCnpjInteressado"]', input => input.value = null);
            await page.type('input[name="cpfCnpjInteressado"]', cpfReq);



            await page.waitForSelector('.aceite-label')
            await page.$eval('input[name="aceiteTermoUso"]', check => check.checked = true);

            await new Promise(r => setTimeout(r, 2000))

            await page.type('input[name="captcha"]', solvedCapatcha.data)


            await page.click('#btEnviar');

            await new Promise(r => setTimeout(r, 10000));

            const err = await page.$x('//*[@id="errors"]')
            const okElement = await page.$x('//*[@id="detalheCheque"]')

            if (err.length > 0) {

                const errText = await page.evaluate(e => e.textContent, err[0])
                if (errText.replaceAll('\n', '').replaceAll(/\t/g, '').replaceAll(' ', '') != '') {
                    console.log(errText)
                    if (errText == "Código da Imagem: Caracteres do captcha não foram preenchidos corretamente ou o tempo máximo para preenchimento foi ultrapassado" || errText == ": Erro inesperado") {
                        await preload.update({ free: true }, { where: { id: barCode.id } })
                    } else if (errText == "Excedida a quantidade de consultas de um mesmo cheque") {
                        await preload.update({ paused: true }, { where: { groupid: barCode.groupid } })
                        await verified.create({ number: barCode.number, status: errText, cpfreq: cpfReq, groupid: barCode.groupid });
                    } else {

                        await verified.create({ number: barCode.number, status: errText, cpfreq: cpfReq });

                    }
                }
            }

            if (okElement.length > 0) {
                const okText = await page.evaluate(e => e.textContent, okElement[0])
                console.log(okText.replace(' ', '').replace(/\t/g, '') == '')
                if (okText.replaceAll('\n', '').replaceAll(/\t/g, '').replaceAll(' ', '') != '') {
                    if (okText.startsWith('Cheque não possui ocorrências')) {
                        await verified.create({ number: barCode.number, status: 'Cheque não possui ocorrências', cpfreq: cpfReq, groupid: barCode.groupid });
                    } else {
                        await verified.create({ number: barCode.number, status: okText, cpfreq: cpfReq, groupid: barCode.groupid });
                    }
                }
            }

            await browser.close()
            this.next()

        } catch (e) {
            console.log(e)
            if (this.data) {
                await preload.update({ free: true }, { where: { id: this.data.id } })
            }
            await browser.close()
            this.next()
        }
    }

    async next() {
        await this.isBreakTime()
        this.start()
    }

}



export default Worker;