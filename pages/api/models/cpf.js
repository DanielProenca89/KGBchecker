import { DataTypes, connection } from './connection'

const cpf = connection.define('CPF',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey: true
    },
    number:{
        type: DataTypes.TEXT,
        unique:true,
        allowNull:false
    }
   
})

export default cpf;
