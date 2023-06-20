import {connection} from '../models/connection'
import preload from '../models/preload'

function validarCMC7(cmc7) {
    // Remover caracteres não numéricos
    cmc7 = cmc7.replace(/\D/g, '');
  
    // Verificar se o CMC7 possui 30 dígitos
    if (cmc7.length !== 30) {
      return false;
    }
  
    // Obter as duas últimas posições do CMC7
    const digito1 = parseInt(cmc7.charAt(28), 10);
    const digito2 = parseInt(cmc7.charAt(29), 10);
  
    // Calcular a soma dos dígitos nas posições pares (0, 2, 4, etc.)
    let soma = 0;
    for (let i = 0; i < 28; i += 2) {
      soma += parseInt(cmc7.charAt(i), 10);
    }
  
    // Multiplicar a soma por 2
    soma *= 2;
  
    // Calcular a soma dos dígitos individuais dos números resultantes da multiplicação
    let somaDigitos = 0;
    while (soma > 0) {
      somaDigitos += soma % 10;
      soma = Math.floor(soma / 10);
    }
  
    // Calcular o dígito verificador
    const digitoVerificador = 10 - (somaDigitos % 10);
  
    // Verificar se os dígitos verificadores estão corretos
    return digito1 === digitoVerificador && digito2 === 0;
  }
  

const _getRandom=()=>{

    var array = [];

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 100; j++) {
            for (var k = 0; k < 10; k++) {
                 array.push([i, j, k]);
            }
        }
    }

    return array

}

const createNumber = async (matrix=[])=>{

        let [cm1, cm2, cm3] = matrix

        cm1 = cm1.split('')
        cm2 = cm2.split('') 
        cm3 = cm3.split('')
        
        const numbers = _getRandom()
        await connection.sync()
        numbers.forEach(async element => {
            
            let [a,b,c] = element
            
            cm1[7] = a.toString()

            cm3[1] = b.toString()[1]?b.toString()[0]:'0'
            cm3[2] = b.toString()[1]?b.toString()[1]:b.toString()[0]
            cm3[11] = c.toString()
            const cmc7 = [cm1.join(''),cm2.join(''),cm3.join('')].join('')
            if(validarCMC7(cmc7)){
            await preload.create({
                number:[cm1.join(''),cm2.join(''),cm3.join('')].join(''),
                free:true
                })
            }
            const count = await preload.count()
            console.log(count)
            });
            
            
            const result = await preload.findAll()
            return result.map(e=>e.dataValues)

}

export default createNumber;