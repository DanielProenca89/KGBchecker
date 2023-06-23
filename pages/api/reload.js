import preload from "./models/preload";
import { connection } from "./models/connection";

export default async function handler(req, res){

    const {groupid} = req.query
    if(groupid){
    await connection.sync()
    await preload.update({paused:false}, {where:{groupid:groupid}})
    res.send('ok')
    }else{
    res.status(400).json({msg:'Parametros incorretos ou inexistentes'})

    }
}