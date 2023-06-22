import { connection } from "./models/connection";
import verified from "./models/verified";


export default async function deleteResults(){
    await connection.sync()
    await verified.destroy()
    return true
}