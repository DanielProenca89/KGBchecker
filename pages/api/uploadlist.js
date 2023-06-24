import createNumberFromList from "./controllers/createCrc7List";


export default async function handler(req, res){

    try{
    const {list} = JSON.parse(req.body);
    console.log(req.body)
    const array = list.split('\n')

    const promises = array.map(async(e)=>{
        const matrix = e.split('|')[0].replaceAll(' ','')
        const [a, b, c] = [matrix.slice(0,8), matrix.slice(8,18), matrix.slice(18)]
        await createNumberFromList([a,b,c], e.split('|')[1])
    
    })
    await  Promise.all(promises)
    res.status(200).json({msg:'ok'})
    }catch(e){
        console.log(e)
    res.status(500).json({msg:e})
    }

}

