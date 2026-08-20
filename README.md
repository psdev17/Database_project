# Blog App — Database Project (Batch 19)

A console-based blogging application built with **Node.js**, **Sequelize**, and **MySQL**. Users can register, log in, and manage their own blogs; admins can manage all users and all blogs. Anyone can read all published blogs without logging in.

## Description

This project demonstrates a relational database design with a one-to-many relationship between `users` and `blogs`:

- One user can create multiple blogs.
- Each blog belongs to exactly one user.
- The `userId` column in `blogs` is a foreign key referencing `id` in `users`.

The app is a menu-driven Node.js CLI (built with `readline`) backed by a MySQL database named `blogdb`, accessed through the Sequelize ORM.

## Tech Stack

- Node.js (ESM / `type: module`)
- JavaScript
- MySQL
- [Sequelize](https://sequelize.org/) — ORM for MySQL
- [dotenv](https://www.npmjs.com/package/dotenv) — environment variable management

## Database Information

**Database name:** `blogdb`

### `users` table

| Column     | Type    | Notes                                   |
|------------|---------|------------------------------------------|
| id         | INTEGER | Primary key, auto-increment              |
| firstName  | STRING  | Required                                 |
| lastName   | STRING  | Required                                 |
| email      | STRING  | Required, unique                         |
| password   | STRING  | Required                                 |
| isActive   | BOOLEAN | Default: `true`. `false` blocks login    |
| role       | STRING  | Default: `user`. Set to `admin` manually |
| createdAt  | DATETIME| Managed automatically by Sequelize       |
| updatedAt  | DATETIME| Managed automatically by Sequelize       |

### `blogs` table

| Column     | Type    | Notes                                          |
|------------|---------|--------------------------------------------------|
| id         | INTEGER | Primary key, auto-increment                     |
| userId     | INTEGER | Foreign key → `users.id`                        |
| blogTitle  | STRING  | Required                                        |
| blog       | TEXT    | Required (blog content)                         |
| category   | STRING  | Optional                                        |
| createdAt  | DATETIME| Managed automatically by Sequelize              |
| updatedAt  | DATETIME| Managed automatically by Sequelize              |

**Relationship:** `User.hasMany(Blog, { foreignKey: 'userId' })` and `Blog.belongsTo(User, { foreignKey: 'userId' })`.

> The tables are created automatically the first time the app runs, via `sequelize.sync()` — no manual SQL scripts are required. Making a user an admin requires manually updating that user's `role` column to `admin` in the database.

## Project Structure

```
Database_project/
├── db.js       # Sequelize connection, models (User, Blog), relationship, initDB()/closeDB()
├── index.js    # All database operations (register, login, CRUD for blogs & users)
├── main.js     # Console UI — menus and user input handling (entry point)
├── .env        # Database credentials (not committed)
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A running MySQL server, with a database named `blogdb` created:
  ```sql
  CREATE DATABASE blogdb;
  ```

### 2. Clone and install dependencies

```bash
git clone <your-repo-url>
cd Database_project
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=blogdb
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
```

> `.env` and `node_modules/` are excluded from version control via `.gitignore`.

### 4. Run the app

```bash
npm start
```

or

```bash
node main.js
```

On first run, Sequelize connects to `blogdb` and automatically creates the `users` and `blogs` tables if they don't already exist.

### 5. Creating an admin user

Every new registration is created with `role = 'user'`. To create an admin, register normally, then update that user's role directly in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Features

### Entry Menu (no login required)

1. **View All Blogs** — lists every blog in the system.
2. **Login** — routes to the User Menu or Admin Menu based on the account's role.
3. **Register** — creates a new user account (default role: `user`, default `isActive: true`).

### User Menu (after login as a regular user)

1. **View Your Blogs** — shows all blog titles created by the logged-in user, or `"No blogs are found"` if none exist.
2. **Search Blog by ID/Title** — searches by numeric blog ID or partial title match.
3. **Create Blog** — adds a new blog linked to the logged-in user via `userId`.
4. **Update Blog** — edits one of the user's own blogs by ID (title, content, and/or category).
5. **Delete Blog** — deletes one of the user's own blogs by ID.

### Admin Menu (after login as an admin)

1. **View All Users** — lists every registered user.
2. **View All Blogs** — lists every blog from every user (with the author's user info included).
3. **Search Blog by ID/Title** — same search as above, across all users' blogs.
4. **Update User** — updates a user's `isActive` status and/or `role`.
5. **Delete User** — permanently removes a user.
6. **Delete Blog** — deletes any blog, regardless of owner.

### Access Control

- A deactivated account (`isActive: false`) cannot log in — the console displays `"User is deactivated"`.
- Regular users can only update or delete their own blogs.
- Admins can update or delete any user or blog.
- Reading all blogs does **not** require login.

## Usage Example

```
===== BLOG APP =====
1. View All Blogs
2. Login
3. Register
0. Exit
Select an option: 3
First name: Jane
Last name: Doe
Email: jane@example.com
Password: ******
User registered successfully

Select an option: 2
Email: jane@example.com
Password: ******
Login successful. Welcome Jane (user)

===== USER MENU (Jane) =====
1. View Your Blogs
2. Search Blog by ID/Title
3. Create Blog
4. Update Blog
5. Delete Blog
0. Logout
```

## Demo Video
 [Watch the project demonstration](  )

## Author

Batch No: 19
