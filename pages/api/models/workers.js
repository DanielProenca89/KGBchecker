import { DataTypes, connection } from './connection'

const workers = connection.define('Workers',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey: true
    },
    name:{
        type: DataTypes.CHAR,
        unique:true,
        allowNull:false
    },
    status:{
        type: DataTypes.CHAR,
    }
})

export default workers;