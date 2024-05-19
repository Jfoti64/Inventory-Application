const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");

// Display list of all Category.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}, "name")
    .sort({ name: 1 })
    .exec();
  res.render("category_list", { title: "Category List", category_list: allCategories });
});

// Display detail page for a specific Category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  // Get details of item
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  // Fetch all items in category only if the category is found
  const item_list = await Item.find({ category: category }).exec();

  res.render("category_detail", {
    title: category.name,
    category: category,
    item_list: item_list,
  });
});

// Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render('category_form', { title: 'Create Category', category: {}, errors: [] });
};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if category with the same name already exists.
      const categoryExists = await Category.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (categoryExists) {
        // Category exists, redirect to its detail page.
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        // New category saved. Redirect to category detail page.
        res.redirect(category.url);
      }
    }
  }),
];

// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    return res.redirect('/catalog/categories');
  }

  // Fetch all items in category only if the category is found
  const item_list = await Item.find({ category: category._id }).exec();

  res.render('category_delete', {
    title: 'Delete Category',
    category: category,
    item_list: item_list,
  });
});

// Handle Category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.body.categoryid).exec();

  if (category === null) {
    // No results. Redirect to list of all categories.
    return res.redirect('/catalog/categories');
  }

  // Delete the category and redirect to the list of categories.
  await Category.findByIdAndDelete(req.body.categoryid);
  res.redirect('/catalog/categories');
});

// Display Category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category update GET");
});

// Handle Category update on POST.
exports.category_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category update POST");
});