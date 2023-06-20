
import Worker from "./controllers/Work"

export default async function handler(req, res) {
  
  

  const {cpf, name} = req.query;


  const worker = Worker
  await worker.setInstance(name)
  worker.cpf = cpf
  await worker.cookies()

  await worker.start()
  
  res.status(200).json({status:"ok"})


}
