import {connection} from '../models/connection'
import preload from '../models/preload'



export default async function deleteMatrix(){
    await connection.sync();
    await preload.destroy({where: {}, truncate: true})
    return true
}