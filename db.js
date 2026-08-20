// DataTypes -> used to define the column data types (STRING, INTEGER, BOOLEAN, TEXT etc.)
// Sequelize -> the class we use to create a connection/instance to the MySQL database
import { DataTypes, Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config(); // loads variables from .env into process.env (DB_HOST, DB_USER, etc.)

// Creates the connection instance to MySQL using credentials from .env
// Order of arguments: database name, username, password, options
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql' // tells Sequelize which SQL dialect/driver to use
    }
);

// ---------- USER MODEL ----------
// sequelize.define(modelName, columns, tableOptions)
// This maps to the "users" table in blogdb
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // auto increases for every new row (1,2,3...)
        primaryKey: true     // unique identifier for each user
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false, // cannot be empty/null
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // no two users can register with the same email
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // every new user is active by default; admin can set to false to block login
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user' // every new user is 'user' by default; changed to 'admin' manually in DB
    }
}, {
    tableName: 'users', // actual table name created in MySQL
    timestamps: true     // auto adds/manages createdAt and updatedAt columns

})

// ---------- BLOG MODEL ----------
// Maps to the "blogs" table in blogdb
const Blog = sequelize.define('Blog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, // foreign key -> links this blog to the User who created it
    },
    blogTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    blog: {
        type: DataTypes.TEXT, // TEXT instead of STRING since blog content can be long
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true, // optional field
    }
}, {
    tableName: 'blogs',
    timestamps: true

})

// ---------- RELATIONSHIP (one-to-many) ----------
// One User can have many Blogs, each Blog belongs to exactly one User.
// This is what creates/links the userId foreign key between the two tables.
User.hasMany(Blog, { foreignKey: 'userId' });
Blog.belongsTo(User, { foreignKey: 'userId' });

// Connects to MySQL and creates/syncs the tables (users, blogs) if they don't exist yet
async function initDB() {
    await sequelize.authenticate(); // tests the DB connection
    await sequelize.sync();         // creates tables based on the models above (if not already created)
    console.log("DB is connected and table is synced")
}

// Closes the DB connection (called at the end of the app/script)
async function closeDB() {
    await sequelize.close();
}

// Export everything needed by index.js/main.js: the connection, both models, and connect/disconnect helpers
export { sequelize, User, Blog, initDB, closeDB }
