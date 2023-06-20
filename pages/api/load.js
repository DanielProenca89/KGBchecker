import createNumber from "./controllers/createCrc7"


export default async function handler(req, res) {
  
    const matrix = req.query.matrix.trim().replace(' ', '')
    console.log(matrix)
    const [a, b, c] = [matrix.slice(0,8), matrix.slice(8,18), matrix.slice(18)]

    await createNumber([a,b,c])

  
  res.status(200).json({status:'ok'})


}
