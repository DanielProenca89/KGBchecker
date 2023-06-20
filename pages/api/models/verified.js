import { DataTypes, connection } from './connection'

const verified = connection.define('Verified',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey: true
    },
    number:{
        type: DataTypes.CHAR,
    },
    status:{
        type: DataTypes.CHAR,
    }
})

export default verified;