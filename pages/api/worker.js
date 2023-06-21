
import Worker from "./controllers/Work"

export default async function handler(req, res) {
  


  const {name} = req.query;


  const worker = Worker
  await worker.setInstance(name)
  await worker.cookies()

  worker.start()
  
  res.status(200).json({status:"ok"})


}
