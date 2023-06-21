
import { connection } from "./models/connection";
import workers from "./models/workers";

export default async function instances(req, res){

    if(req.method == 'GET'){

        await connection.sync()
        const response = await workers.findAll()
        const json = response.map(e=>e.dataValues)
        res.send(json)

    }

    if(req.method == 'DELETE'){
       
        const id = req.query.id
        
        await connection.sync()
        await workers.destroy({where:{id:id}})
        const response = await workers.findAll()
        const json = response.map(e=>e.dataValues)
        res.send(json)
    }

    res.status(500)

}
