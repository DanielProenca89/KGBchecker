import { Sequelize, DataTypes, Model } from 'sequelize'

const connection = new Sequelize({
    dialect: 'sqlite',
    storage: './database/db.sqlite',
    logging: false
});

export {connection, Model, DataTypes};