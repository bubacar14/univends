const Product = require('../models/Product');

// Obtenir tous les produits avec pagination et filtres
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy } = req.query;
    const query = {};

    // Appliquer les filtres
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculer le nombre total pour la pagination
    const total = await Product.countDocuments(query);
    
    // Construire la requête avec tri
    let productsQuery = Product.find(query)
      .populate('seller', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Appliquer le tri
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      productsQuery = productsQuery.sort({ [field]: order === 'desc' ? -1 : 1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery;

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Error retrieving products' });
  }
};

// Créer un nouveau produit
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, images } = req.body;
    const seller = req.user.uid;

    const product = new Product({
      title,
      description,
      price,
      category,
      images,
      seller
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

// Obtenir un produit par ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Error retrieving product' });
  }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, images, status } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (product.seller.toString() !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.images = images || product.images;
    product.status = status || product.status;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (product.seller.toString() !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};

// Ajouter/Retirer des favoris
exports.toggleFavorite = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const userIndex = product.favorites.indexOf(req.user.uid);
    
    if (userIndex === -1) {
      // Ajouter aux favoris
      product.favorites.push(req.user.uid);
    } else {
      // Retirer des favoris
      product.favorites.splice(userIndex, 1);
    }

    await product.save();
    res.json({ message: 'Favorite status updated', isFavorite: userIndex === -1 });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Error updating favorite status' });
  }
};