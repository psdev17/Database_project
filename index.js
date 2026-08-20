import { Op } from "sequelize";
import { User, Blog } from "./db.js";

// ---------- AUTH ----------

export async function registerUser(firstName, lastName, email, password) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
        console.log("User already registered with this email");
        return null;
    }

    const user = await User.create({ firstName, lastName, email, password });
    console.log("User registered successfully");
    return user;
}

export async function loginUser(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        console.log("User not found");
        return null;
    }
    if (!user.isActive) {
        console.log("User is deactivated");
        return null;
    }
    if (user.password !== password) {
        console.log("Incorrect password");
        return null;
    }

    console.log(`Login successful. Welcome ${user.firstName} (${user.role})`);
    return user;
}

// ---------- READER (no login needed) ----------

export async function allBlog() {
    const blogs = await Blog.findAll();
    if (blogs.length === 0) {
        console.log("No blogs are found");
        return blogs;
    }
    console.log("All Blogs:", JSON.stringify(blogs, null, 2));
    return blogs;
}

// ---------- USER (after login) ----------

export async function myBlogs(userId) {
    const blogs = await Blog.findAll({ where: { userId } });
    if (blogs.length === 0) {
        console.log("No blogs are found");
        return blogs;
    }
    console.log("Your Blogs:");
    blogs.forEach(b => console.log(`ID: ${b.id} - ${b.blogTitle}`));
    return blogs;
}

// Used by both the logged-in user's menu and the admin menu
export async function searchBlog(query) {
    const input = String(query ?? "").trim();
    const isNumericId = /^\d+$/.test(input);

    const where = isNumericId
        ? { id: Number(input) }
        : { blogTitle: { [Op.like]: `%${input}%` } };

    const blogs = await Blog.findAll({ where });
    if (blogs.length === 0) {
        console.log("No blog found");
    } else {
        console.log(`Search results for "${query}":`, JSON.stringify(blogs, null, 2));
    }
    return blogs;
}

export async function createBlog(userId, blogTitle, blog, category) {
    const newBlog = await Blog.create({ userId, blogTitle, blog, category });
    console.log("Blog created successfully");
    return newBlog;
}

// userId is passed by the regular user's menu so they can only edit their own blog.
// Admin calls this without userId (null) so it can update any blog.
export async function updateBlog(id, blogObj, userId = null) {
    const where = userId ? { id, userId } : { id };
    const [affectedRows] = await Blog.update(blogObj, { where });
    if (affectedRows === 0) {
        console.log("No blog found with the given id");
        return null;
    }
    const updated = await Blog.findByPk(id);
    console.log("Blog updated successfully");
    return updated;
}

// Same idea as updateBlog: userId restricts a regular user to their own blog,
// admin passes no userId and can delete any blog.
export async function deleteBlog(id, userId = null) {
    const where = userId ? { id, userId } : { id };
    const deleted = await Blog.destroy({ where });
    if (deleted === 0) {
        console.log("Blog not found");
    } else {
        console.log("Blog deleted");
    }
}

// ---------- ADMIN ----------

export async function allUsers() {
    const users = await User.findAll();
    console.log("User list:", JSON.stringify(users, null, 2));
    return users;
}

export async function allUsersBlog() {
    const blogs = await Blog.findAll({ include: User });
    console.log("All Users' Blogs:", JSON.stringify(blogs, null, 2));
    return blogs;
}

// Used by admin to change isActive (block/unblock login) or role, e.g. updateUser(id, {isActive:false})
export async function updateUser(id, userObj) {
    const [affectedRows] = await User.update(userObj, { where: { id } });
    if (affectedRows === 0) {
        console.log("No user found with the id");
    } else {
        console.log("User is updated");
    }
}

export async function deleteUser(id) {
    const deleted = await User.destroy({ where: { id } });
    if (deleted === 0) {
        console.log("User not found");
    } else {
        console.log("User deleted");
    }
}
