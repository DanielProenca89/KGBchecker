import deleteResults from "./controllers/deleteResults";


export default async function handler(){

    await deleteResults()
    return true

}