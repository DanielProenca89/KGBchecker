import loadCpf from "./controllers/loadCpf";

export default async function handler(req, res){

    await loadCpf();

    res.send('ok')
}