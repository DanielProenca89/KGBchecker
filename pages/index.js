import { useEffect, useState } from "react";

export default function Home() {
  
  const [loading, setLoading]=useState(false)
  const [results, setResults] = useState([])
  const [instances, setInstances] = useState([])
  const [instanceName, setInstaceName] = useState("")
  const [cpf, setCpf] = useState("")
  const [matrix, setMatrix] = useState("")
  
  const load= async ()=>{
  if(matrix.length == 30){
  setLoading(true)
  await fetch(`api/load?matrix=${matrix}`)
  setLoading(false)
  }else{
    window.alert('Confira sua matriz')
  }
  }

  const work= async ()=>{
    if(cpf.length == 11 && instanceName.length > 1){
    await fetch(`api/worker?cpf=${cpf}&name=${instanceName}`)
    }else{
      window.alert('Confira os dados e tente novamente')
    }
  }


  async function getResults(){
    const res = await fetch('api/results')
    const json = await res.json()
    setResults(json)
  }

  async function getInstances(){
    const res = await fetch('api/instances')
    const json = await res.json()
    setInstances(json)

  }

  async function deleteInstances(id){
    const res = await fetch('api/instances', {method:"DELETE", body:JSON.stringify({id:id}),  headers: {
      "Content-Type": "application/json",
  }})
    const json = await res.json()
    setInstances(json)

  }

  useEffect(()=>{

    setInterval(()=>{
      //getResults()
    },3000)
    getInstances()

  },[])


return(
  <>

  
  
<div style={{display:'grid', gridTemplateRows:"auto auto auto", justifyContent:"center", gap:"2em"}}>

<div  style={{marginTop:"1em"}}>
  <label style={{display:"block"}}>Insira a matriz</label>
  <input style={{display:"block"}} onChange={(e)=>setMatrix(e.target.value)} type="text"/>
  <button onClick={()=>load()}>{loading?'Carregando...':'Gerar números'}</button>  
</div>


<div  style={{marginTop:"1em"}}>
  <label style={{display:"block"}}>Insira o nome da instancia</label>
  <input style={{display:"block"}} onChange={(e)=>setInstaceName(e.target.value)} type="text"/>  
</div>


<div>
  <label style={{display:"block"}} >Insira o CPF do Dono</label>
  <input style={{display:"block"}} onChange={(e)=>setCpf(e.target.value)} type="number"/>
  <button onClick={()=>work()}>Nova Instancia</button>
</div>




</div>
<span style={{margin:"1em"}}>Resultados: <strong>{results.length}</strong></span>
<textarea style={{width:"100%", height:"200px", overflow:"scroll", margin:"1em"}} value={results?.map(e=> [e.number.slice(0,8), e.number.slice(8,18), e.number.slice(18)].join(' ') +"  "+ e.status).join('\n')}></textarea>
<br/>
<div style={{display:"grid", gridTemplateColumns:"auto auto auto", columnGap:"1em" ,margin:"1em"}}>
  {instances?.map(e=> <div style={{width:"100%", padding:"2em", textAlign:"center", border:"1px solid #000"}}><div><span><strong>{e.name}</strong></span></div><button style={{display:"block"}} onClick={()=>deleteInstances(e.id)}>Deletar</button></div>)}
</div>


</>
)

}
