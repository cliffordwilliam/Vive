const multer = require("multer");
const ImageKit = require("imagekit");

const storage = multer.memoryStorage();

class Util {
  static imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  static upload = multer({
    storage,
  });
}

module.exports = Util;
