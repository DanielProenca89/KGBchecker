import deleteResults from "./controllers/deleteResults";


export default async function handler(){

    await deleteResults()
    res.send('ok')

}