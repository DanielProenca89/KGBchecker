import deleteMatrix from "./controllers/deleteMatrix";


export default  async function handler(req, res){

    if(req.query.groupid){
        await deleteMatrix({groupid:req.query.groupid})    
        res.send('ok')
    }else{
    
        await deleteMatrix()
        res.send('ok')
    }
}