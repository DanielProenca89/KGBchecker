import {connection} from '../models/connection'
import preload from '../models/preload'



export default async function deleteMatrix(where={}){
    await connection.sync();
    await preload.destroy({where:where, truncate: where?false:true})
    return true
}