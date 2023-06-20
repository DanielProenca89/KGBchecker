import { Sequelize, DataTypes, Model } from 'sequelize'

const connection = new Sequelize({
    dialect: 'sqlite',
    storage: './database/db.sqlite'
});

export {connection, Model, DataTypes};