
import Worker from "./controllers/Work"

export default async function handler(req, res) {
  


  const {name, groupid} = req.query;


  const worker = new Worker
  await worker.setInstance(name, groupid)
  await worker.cookies()

  worker.start()
  
  res.status(200).json({status:"ok"})


}
