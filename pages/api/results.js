import verified from "./models/verified";
import { connection } from "./models/connection";


export default async function getResults(req, res){
    await connection.sync()
    const response = await verified.findAll()
    const json = response.map(e=>e.dataValues)
    res.send(json)
}

