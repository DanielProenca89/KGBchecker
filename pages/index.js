import { useEffect, useState } from "react";
import { io } from "socket.io-client";
export default function Home() {
  
  const [loading, setLoading]=useState(false)
  const [deletingMatrix, setDeletingMatrix] = useState(false)
  const [deletingResults, setDeletingResults] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState([])
  const [instances, setInstances] = useState([])
  const [instanceName, setInstaceName] = useState("")
  const [cpf, setCpf] = useState("")
  const [matrix, setMatrix] = useState("")
  const [loaded, setLoaded] = useState({})
  
  const load= async ()=>{
  const socket = io('http://149.56.91.175:3001')
  if(matrix.length == 30 && cpf.length > 0){
  setLoading(true)
  socket.on('loading', msg => setProgress(msg+'%'))
  await fetch(`api/load?matrix=${matrix}&cpf=${cpf}`)
  setLoading(false)
  setProgress(0)
  }else{
    window.alert('Confira sua matriz')
  }
  socket.close()
  }

  const work= async ()=>{
    if(instanceName.length > 1){
    await fetch(`api/worker?name=${instanceName}`)
    await getInstances()
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
    const res = await fetch(`api/instances?id=${id}`, {method:"DELETE"})
    const json = await res.json()
    setInstances(json)

  }

  async function deleteMatrix(groupid=undefined){
    if(groupid){
      await fetch('api/deleteMatrix?groupid='+groupid)
    }else{
    if(window.confirm("Isso apagará todas as matrizes geradas. Deseja prosseguir?")){
      setDeletingMatrix(true)
      await fetch('api/deleteMatrix')
      setDeletingMatrix(false)
    }

    }
  }


  async function deleteResults(){
    if(window.confirm("Isso apagará todas os resultados. Deseja prosseguir?")){
      setDeletingResults(true)
      await fetch('api/deleteResults')
      setDeletingResults(false)


    }
  }


  async function getLoaded(){
    const res = await fetch('api/loaded')
    const json = await res.json()
    setLoaded(json)
  }

  async function reloadMatrix(groupid){
    await fetch('api/reload?groupid='+groupid)
  }

  useEffect(()=>{

    setInterval(()=>{
      getResults()
      getInstances()
      getLoaded()
    },3000)
    

  },[])


return(
  <>

  
  
<div style={{display:'grid',  gridTemplateColumns:"50% 50%" , justifyContent:"center", gap:"2em"}}>

<div  style={{marginTop:"1em", display:'grid', justifyContent:"center"}}>

  <label style={{display:"block"}}>Insira a matriz</label>
  <input style={{display:"block"}} onChange={(e)=>setMatrix(e.target.value)} type="text"/>
  <br/>
  <label style={{display:"block"}} >Insira o CPF do Dono</label>
  <input style={{display:"block",  marginBottom:"5px"}} onChange={(e)=>setCpf(e.target.value)} type="number"/>


  <button onClick={()=>load()}>{loading?'Carregando... '+ progress:'Gerar números'}</button>
  <br/>
  <button onClick={()=>deleteMatrix()}>{deletingMatrix?'Deletando. Aguarde...':'Limpar matrizes'}</button>
  <br/>




  <label style={{display:"block"}}>Insira o nome da instancia</label>
  <input style={{display:"block"}} onChange={(e)=>setInstaceName(e.target.value)} type="text"/>  
  <button onClick={()=>work()}>Nova Instancia</button>
</div>

<div>
  <h4>Matrizes</h4>
  {loaded.length>0?loaded.map((e,i)=> 
  <div key={i} style={{marginTop:"10px"}}><strong>{e.groupid}</strong>  ---  <strong>{e.paused == 0?'Ativa':'Pausada'}
  </strong> --- <strong>
    {e.numbers}
    </strong> / <strong>{e.numbers - e.free}
    </strong> 
    <button onClick={()=>deleteMatrix(e.groupid)} style={{marginRight:"5px"}}>Apagar</button> 
    {e.paused == 0?"":<button onClick={()=>reloadMatrix(e.groupid)}>Reativar</button>} </div>):""}
</div>


</div>






<span style={{margin:"1em"}}>Resultados: <strong>{results.length}</strong></span>
<textarea style={{width:"100%", height:"200px", overflow:"scroll", margin:"1em"}} value={results?.map(e=> [e.number.slice(0,8), e.number.slice(8,18), e.number.slice(18)].join(' ') +"  "+ e.status).join('\n')}></textarea>
<button onClick={()=>deleteResults()}>{deletingResults?'Deletando. Aguarde...':'Limpar resultados'}</button>
<br/>
<div style={{display:"grid", gridTemplateColumns:"25% 25% 25% 25%", columnGap:"1em" ,margin:"1em"}}>
  {instances?.map((e,i)=> <div key={i} style={{width:"100%", padding:"2em", textAlign:"center", border:"1px solid #000"}}><div><span><strong>{e.name}</strong></span></div><button style={{display:"block"}} onClick={()=>deleteInstances(e.id)}>Deletar</button></div>)}
</div>


</>
)

}
