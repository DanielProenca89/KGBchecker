import getProxyList from "./controllers/getProxy"

export default async function proxy(req, res){

    const response = await getProxyList();
    res.send(response.data)
    
}