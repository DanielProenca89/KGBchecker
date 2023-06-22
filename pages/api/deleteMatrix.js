import deleteMatrix from "./controllers/deleteMatrix";


export default  async function handler(req, res){

    await deleteMatrix()
    res.send('ok')

}