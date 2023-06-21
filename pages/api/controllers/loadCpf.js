import { connection } from "../models/connection"
import cpf from "../models/cpf"
import fs from 'fs'

export default async function loadCpf(){
    await connection.sync({force:true})
    const read = fs.readFileSync('./public/listacpf.txt',"utf8")
    const list = read.split('\n').map(e=> {return {number:e}})
    await cpf.bulkCreate(list,{ignoreDuplicates: true})
    
    return true
}