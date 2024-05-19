const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of items and categories counts
  const [
    numItems,
    numCategories,
  ] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Inventory Application Home",
    item_count: numItems,
    category_count: numCategories,
  });
});

exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name")
    .sort({ name: 1 })
    .exec();
  res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  // Fetch the category only if the item is found
  const category = await Category.findById(item.category).exec();

  res.render("item_detail", {
    title: item.name,
    item: item,
    category: category
  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  // Get all categories
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render('item_form', {
    title: 'Create Item',
    categories: allCategories,
    item: {}, // Ensure `item` is always defined
    errors: [] // Ensure `errors` is always defined
  });
});

// Handle item create on POST.
exports.item_create_post = [
  // Validate and sanitize fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('price', 'Price must be a positive number.').isFloat({ min: 0 }).escape(),
  body('num_in_stock', 'Number in stock must be a non-negative integer.').isInt({ min: 0 }).escape(),
  body('category.*').escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      num_in_stock: req.body.num_in_stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      // Mark selected categories as checked.
      for (const category of allCategories) {
        if (item.category && item.category.includes(category._id)) {
          category.checked = 'true';
        }
      }

      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if item with the same name already exists.
      const itemExists = await Item.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (itemExists) {
        // Item exists, redirect to its detail page.
        res.redirect(itemExists.url);
      } else {
        await item.save();
        // New item saved. Redirect to item detail page.
        res.redirect(item.url);
      }
    }
  }),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    // No results.
    return res.redirect('/catalog/item');
  }

  res.render('item_delete', {
    title: 'Delete item',
    item: item,
  });
});


// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item delete POST");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item update GET");
});

// Handle item update on POST.
exports.item_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item update POST");
});