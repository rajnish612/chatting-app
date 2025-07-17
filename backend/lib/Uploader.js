import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload = async (image) => {
  try {
    const res = await cloudinary.uploader.upload(image, {
      folder: "chattingApp",
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};
