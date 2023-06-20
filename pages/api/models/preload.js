import { DataTypes, connection } from './connection'

const preload = connection.define('Preload',{
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
    },
    free:{
        type: DataTypes.BOOLEAN,
    }
})

export default preload;
