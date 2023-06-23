import deleteResults from "./controllers/deleteResults";


export default async function handler(req, res){

    await deleteResults()
    res.send('ok')

}