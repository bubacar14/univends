const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'univends',
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      resource_type: 'auto'
    });

    // Supprimer le fichier temporaire
    fs.unlinkSync(file.path);

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    // Supprimer le fichier temporaire en cas d'erreur
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
