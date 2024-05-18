#!/usr/bin/env node

console.log(
  'This script populates some test items and categories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require("./models/item");
const Category = require("./models/category");

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories(); // Create categories first
  await createItems(); // Then create items
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function categoryCreate(index, name, description) {
  const categorydetail = { name, description };
  
  const category = new Category(categorydetail);
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function itemCreate(index, name, description, price, num_in_stock, category) {
  const itemdetail = {
    name,
    description,
    price,
    num_in_stock,
    category
  };

  const item = new Item(itemdetail);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function createCategories() {
  console.log("Debug: Creating categories");
  await categoryCreate(0, "Electronics", "Devices and gadgets");
  await categoryCreate(1, "Books", "Printed and digital books");
  await categoryCreate(2, "Clothing", "Men and women clothing");
  await categoryCreate(3, "Furniture", "Home and office furniture");
  await categoryCreate(4, "Toys", "Toys and games for children");
  await categoryCreate(5, "Groceries", "Daily essentials and food items");
}

async function createItems() {
  console.log("Debug: Creating items");
  await itemCreate(0, "Smartphone", "A modern smartphone", 599, 50, categories[0]);
  await itemCreate(1, "Laptop", "A powerful laptop", 999, 30, categories[0]);
  await itemCreate(2, "Novel", "A captivating novel", 19.99, 100, categories[1]);
  await itemCreate(3, "T-shirt", "A comfortable T-shirt", 9.99, 200, categories[2]);
  await itemCreate(4, "Sofa", "A comfortable sofa", 299, 10, categories[3]);
  await itemCreate(5, "Desk", "A wooden desk", 149, 20, categories[3]);
  await itemCreate(6, "Action Figure", "A popular action figure", 14.99, 150, categories[4]);
  await itemCreate(7, "Board Game", "A fun board game for the family", 29.99, 75, categories[4]);
  await itemCreate(8, "Milk", "A gallon of milk", 3.99, 200, categories[5]);
  await itemCreate(9, "Bread", "A loaf of bread", 2.99, 150, categories[5]);
}
