const router = require("express").Router();
const { Category, Product } = require("../../models");
const { findAll } = require("../../models/Category");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  try {
    // find all categories
    const viewCategories = await Category.findAll({
      include: [
        {
          model: Product,
          as: "products",
        },
      ],
    });
    if (!viewCategories.length) {
      return res.status(404).json({
        error: "Not Found!",
      });
    }
    return res.status(200).json(viewCategories);
  } catch (err) {
    return res.status(500).json({
      error: "Sorry we are unable to get data for this category at this time",
    });
  }
});

router.get("/:id", async (req, res) => {
  // find one category by its `id` value
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "products",
        },
      ],
    });
    if (!category) {
      return res.status(404).json({
        error: "Not Found!",
      });
    }
    return res.status(200).json(category);
  } catch (err) {
    return res.status(500).json({
      error: "Sorry we are unable to get data for this category at this time",
    });
  }
});

router.post("/", (req, res) => {
  // create a new category
  try {
    const { newCategory } = req.body;

    if (!newCategory) {
      return res.status(400).json({
        error: "values undefined",
        message: "Please provide a new category name",
      });
    }
    return res.status(200).json({
      message: "A new category has been created",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Sorry we are unable to create a new category at this time",
    });
  }
});

router.put("/:id", async (req, res) => {
  // update a category by its `id` value
  try {
    const { newCategory } = req.body;
    const { id } = req.params;

    if (!newCategory) {
      return res.status(400).json({
        error: "Values undefined",
        message:
          "Please provide the new category name and id of the category that needs updating",
      });
    }
    const updateResult = await Category.update(
      { newCategory },
      {
        where: { id },
      }
    );

    if (updateResult[0] == 0) {
      return res.status(404).json({
        error: "Category does not exist ",
      });
    }
    return res.status(200).json({
      message: "Category updated",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Sorry we could not update your category at this time",
    });
  }
});

router.delete("/:id", async (req, res) => {
  // delete a category by its `id` value
  try {
    const { id } = req.params;

    const deleteResult = await Category.destroy({
      where: { id },
    });
    if (!deleteResult) {
      return res.status(404).json({
        error: "category doesn't exist",
      });
    }
    return res.status(200).json({
      message: "the category has been successfully deleted",
    });
  } catch (error) {
    return res.status(500).json({
      error:
        "we were unable to delete the category at this time. Please try again later.",
    });
  }
});

module.exports = router;
