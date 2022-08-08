const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  // find all products
  try {
    const allProducts = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
        },
        { model: Tag, as: "tags", through: ProductTag },
      ],
    });
    if (!allProducts) {
      return res.status(404).json({
        error: "No product found",
      });
    }
    return res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({
      error:
        "Sorry we can not provide all product information at this time. Please try again later",
    });
  }
});

// get one product
router.get("/:id", async (req, res) => {
  // find a single product by its `id`
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category",
        },
        { model: Tag, as: "tags" },
      ],
    });
    if (!product) {
      return res.status(404).json({
        error: "No product found",
      });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      error:
        "Sorry we could not get this products information at this time, please try again later ",
    });
  }
});

// create new product
router.post("/", async (req, res) => {
  try {
    const { product_name, price, stock, tagIds } = req.body;
    if (!product_name || !price || !stock) {
      return res.status(400).json({
        error: "values undefined",
        message:
          "Please provide the product name, the price and the stock information.",
      });
    }
    newProduct = await Product.create({
      product_name,
      price,
      stock,
    });
    if (tagIds && tagIds.length) {
      try {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: newProduct.id,
            tag_id,
          };
        });
        await ProductTag.bulkCreate(productTagIdArr);
        return res.status(200).json({
          message: "your Product has been successfully created",
          product: newProduct,
        });
      } catch (error) {
        return res.status(500).json({
          error:
            "Sorry we are unable to add product tags at this time, Please try again later. ",
        });
      }
    }
    return res.status(200).json({
      message: "Your new product has been created",
      product: "newProduct",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Sorry, we could not create your product at this time.",
    });
  }
});

// update product
router.put("/:id", async (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  // delete one product by its `id` value
  try {
    const deleteResult = await Product.destroy({
      where: { id: req.params.id },
    });

    if (!deleteResult) {
      return res.status(404).json({
        error: "Product does not exist",
      });
    }

    return res.status(200).json({
      message: "The product has been deleted",
    });
  } catch (error) {
    return res.status(500).json({
      error:
        "We were unable to delete the product at this time. Please try again later.",
    });
  }
});

module.exports = router;
