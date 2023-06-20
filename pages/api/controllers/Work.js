import puppeteer from 'puppeteer';
import { connection } from '../models/connection';
import getCaptcha from './getCaptcha';
import preload from '../models/preload';
import workers from '../models/workers';
import verified from '../models/verified';
import saveCookies from './getCookies'
import sharp from 'sharp'
import getProxyList from './getProxy';
import fs from 'fs'


const Worker= {

    workerName:"",
    proxy:{},
    page:{},
    cpf : "",
    

    async getCpf(){
        const read = fs.readFileSync('./public/listacpf.txt',"utf8")
        const cpf = read.split('\n')
        const change = Math.floor(Math.random() * cpf.length)
        return cpf[change]

    },
    
    async getBarCode(){
        this.data = null;
        await connection.sync();
        const res = await preload.findOne({where:{free:true}});
        const data = res.toJSON()
        if(data){
            preload.update({free:false}, {where:{id:data.id}});
            this.data = data;
            return data
        }else{
            this.data = null
            return null
        }
        
    },

    async handleImage(imagename){
        const imagePath = './public/'+imagename;
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
        return 'ok_'+imagename;
        },

        async captcha(img){
            const res = await getCaptcha(img)
            return res.data;
        },

        async cookies(){
            await this.setProxy();
            await saveCookies(this.workerName, this.proxy)
        },

        async setProxy(){
            const res = await getProxyList()
            const change = Math.floor(Math.random() * 51)
            this.proxy = res.data[change]
            return res.data[change]
        },

       
        async setInstance(name, cpf){
            this.workerName = name
            try{
      
            await connection.sync()
            await workers.create({name:name, status:"Iniciando", cpf:cpf})            
            return true
            }catch{
            return false
            }
        },
          

        async start(){

            const verifyInstance = await workers.findOne({where:{name:this.workerName}})
            const instance = verifyInstance.toJSON()
            if(!instance) browser.close();
            this.id = instance.id
            const browser = await puppeteer.launch( {headless: false,defaultViewport: null,args: ['--start-maximized', 
            `--proxy-server=${this.proxy.ip}:${this.proxy.port}`] });

           const page = await browser.newPage();
           const cookies = fs.readFileSync(`./public/cookies/${this.workerName}.json`, "utf8");

           for (const cookie of JSON.parse(cookies)) {
           await page.setCookie(cookie);
           }
           try{
            await page.goto('https://www.chequelegal.com.br');
          
            const checkReloadCaptcha = () => null;
           const atualizacaoAutomaticaCaptcha = ()=>null
           await page.exposeFunction(checkReloadCaptcha.name, checkReloadCaptcha);
           await page.evaluate(() => checkReloadCaptcha());
           await page.exposeFunction(atualizacaoAutomaticaCaptcha.name, atualizacaoAutomaticaCaptcha);
           await page.evaluate(() => atualizacaoAutomaticaCaptcha());
      
            const barCode  =  await this.getBarCode();
            if (!barCode){
                 await workers.destroy({where:{id:this.id}})
                 browser.close();
            }
            const [a, b, c] = [barCode.number.slice(0,8), barCode.number.slice(8,18), barCode.number.slice(18)];
            const cpfReq = await this.getCpf()
            
            await page.waitForXPath('//*[@id="lbCaptcha"]/table/tbody/tr/td[2]')
            const [cap] = await page.$x('//*[@id="lbCaptcha"]/table/tbody/tr/td[2]')

            const imgname = new Date().getMilliseconds()+'.png'
            await cap.screenshot({path: './public/'+imgname,threshold:0})
            const capImage = await this.handleImage(imgname)
            
            const solvedCapatcha = await getCaptcha(false,capImage)

            await page.$eval('input[name="cpfCnpjEmitente"]', input => input.value = null);
            await page.type('input[name="cpfCnpjEmitente"]', this.cpf);

            await page.$eval('input[name="primeiroCampoCmc7"]', input => input.value = null);
            await page.type('input[name="primeiroCampoCmc7"]', a);
            
            await page.$eval('input[name="segundoCampoCmc7"]', input => input.value = null);
            await page.type('input[name="segundoCampoCmc7"]', b);

            await page.$eval('input[name="terceiroCampoCmc7"]', input => input.value = null);
            await page.type('input[name="terceiroCampoCmc7"]', c);
            
            await page.$eval('input[name="cpfCnpjInteressado"]', input => input.value = null);
            await page.type('input[name="cpfCnpjInteressado"]', cpfReq);
            

            await page.waitForSelector('.aceite-label')
            await page.$eval('input[name="aceiteTermoUso"]', 
            check => check.checked = true);
            
            await new Promise(r => setTimeout(r, 2000))

            await page.type('input[name="captcha"]', solvedCapatcha.data)


            await page.click('#btEnviar');
            await page.waitForXPath('//*[@id="errors"]/ul/li')
            const err = await page.$eval('#errors', (element) => element.textContent);

            if (err){
            console.log(err)
                if(err == "Código da Imagem: Caracteres do captcha não foram preenchidos corretamente ou o tempo máximo para preenchimento foi ultrapassado"){
                await preload.update({free:true}, {where:{id:barCode.id}})
                }else{
                               
                await verified.create({number:barCode.number, status:err});

            }
            }else{
                await verified.create({number:barCode.number, status:"Ok"});

            }
            await page.$eval('input[name="btnLimpar"]', bt=> bt.click())
            await browser.close()
            this.next()
        }catch(e){
            console.log(e)
            await browser.close()
            this.next()
        }
        },

        async next(){
            this.start()
        }

}



export default Worker;