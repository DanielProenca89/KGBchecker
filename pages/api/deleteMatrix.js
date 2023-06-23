import deleteMatrix from "./controllers/deleteMatrix";


export default  async function handler(req, res){

    if(req.query.groupid){
        await deleteMatrix({groupid:req.query.groupid})    
    }else{
    
        await deleteMatrix()
        res.send('ok')
    }
}