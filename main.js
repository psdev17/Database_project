import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { initDB, closeDB } from "./db.js";
import {
    registerUser, loginUser, allBlog, myBlogs, searchBlog,
    createBlog, updateBlog, deleteBlog,
    allUsers, allUsersBlog, updateUser, deleteUser
} from "./index.js";

const rl = readline.createInterface({ input, output });

// ---------- ENTRY MENU ----------

async function mainMenu() {
    while (true) {
        console.log("\n===== BLOG APP =====");
        console.log("1. View All Blogs");
        console.log("2. Login");
        console.log("3. Register");
        console.log("0. Exit");
        const choice = await rl.question("Select an option: ");

        switch (choice.trim()) {
            case "1":
                await allBlog();
                break;
            case "2":
                await loginFlow();
                break;
            case "3":
                await registerFlow();
                break;
            case "0":
                return;
            default:
                console.log("Invalid option");
        }
    }
}

async function registerFlow() {
    const firstName = await rl.question("First name: ");
    const lastName = await rl.question("Last name: ");
    const email = await rl.question("Email: ");
    const password = await rl.question("Password: ");
    await registerUser(firstName, lastName, email, password);
}

async function loginFlow() {
    const email = await rl.question("Email: ");
    const password = await rl.question("Password: ");
    const user = await loginUser(email, password);
    if (!user) return; // loginUser already printed the reason (not found / deactivated / wrong password)

    if (user.role === "admin") {
        await adminMenu(user);
    } else {
        await userMenu(user);
    }
}

// ---------- USER MENU (after login) ----------

async function userMenu(user) {
    while (true) {
        console.log(`\n===== USER MENU (${user.firstName}) =====`);
        console.log("1. View Your Blogs");
        console.log("2. Search Blog by ID/Title");
        console.log("3. Create Blog");
        console.log("4. Update Blog");
        console.log("5. Delete Blog");
        console.log("0. Logout");
        const choice = await rl.question("Select an option: ");

        switch (choice.trim()) {
            case "1":
                await myBlogs(user.id);
                break;
            case "2": {
                const query = await rl.question("Enter blog ID or title: ");
                await searchBlog(query);
                break;
            }
            case "3": {
                const blogTitle = await rl.question("Blog title: ");
                const blog = await rl.question("Blog content: ");
                const category = await rl.question("Category: ");
                await createBlog(user.id, blogTitle, blog, category);
                break;
            }
            case "4": {
                const id = await rl.question("Blog ID to update: ");
                const blogTitle = await rl.question("New title (leave blank to skip): ");
                const blog = await rl.question("New content (leave blank to skip): ");
                const category = await rl.question("New category (leave blank to skip): ");

                const blogObj = {};
                if (blogTitle.trim()) blogObj.blogTitle = blogTitle;
                if (blog.trim()) blogObj.blog = blog;
                if (category.trim()) blogObj.category = category;

                // userId is passed so a user can only update their own blog
                await updateBlog(Number(id), blogObj, user.id);
                break;
            }
            case "5": {
                const id = await rl.question("Blog ID to delete: ");
                // userId is passed so a user can only delete their own blog
                await deleteBlog(Number(id), user.id);
                break;
            }
            case "0":
                return;
            default:
                console.log("Invalid option");
        }
    }
}

// ---------- ADMIN MENU (after login) ----------

async function adminMenu(user) {
    while (true) {
        console.log(`\n===== ADMIN MENU (${user.firstName}) =====`);
        console.log("1. View All Users");
        console.log("2. View All Blogs");
        console.log("3. Search Blog by ID/Title");
        console.log("4. Update User");
        console.log("5. Delete User");
        console.log("6. Delete Blog");
        console.log("0. Logout");
        const choice = await rl.question("Select an option: ");

        switch (choice.trim()) {
            case "1":
                await allUsers();
                break;
            case "2":
                await allUsersBlog();
                break;
            case "3": {
                const query = await rl.question("Enter blog ID or title: ");
                await searchBlog(query);
                break;
            }
            case "4": {
                const id = await rl.question("User ID to update: ");
                const isActiveInput = await rl.question("Set isActive (true/false, leave blank to skip): ");
                const roleInput = await rl.question("Set role (leave blank to skip): ");

                const userObj = {};
                if (isActiveInput.trim()) userObj.isActive = isActiveInput.trim().toLowerCase() === "true";
                if (roleInput.trim()) userObj.role = roleInput.trim();

                await updateUser(Number(id), userObj);
                break;
            }
            case "5": {
                const id = await rl.question("User ID to delete: ");
                await deleteUser(Number(id));
                break;
            }
            case "6": {
                const id = await rl.question("Blog ID to delete: ");
                // no userId passed -> admin can delete any blog
                await deleteBlog(Number(id));
                break;
            }
            case "0":
                return;
            default:
                console.log("Invalid option");
        }
    }
}

// ---------- APP START ----------

try {
    await initDB();
    await mainMenu();
} finally {
    rl.close();
    await closeDB();
}
