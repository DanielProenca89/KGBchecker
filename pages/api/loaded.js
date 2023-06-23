import preload from "./models/preload";
import { connection } from "./models/connection";
import { Sequelize, QueryTypes } from "sequelize";


export default async function handler(req, res){

    await connection.sync()
    const response = await connection.query('SELECT id,groupid,COUNT(*) as numbers, sum(free) as free, case when sum(paused) > 0 then true else false end as paused  FROM Preloads GROUP BY groupid', {type:QueryTypes.SELECT})
    
    res.send(response)
}