import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import { url } from "inspector";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const upload = async (image) => {
  console.log(
    process.env.CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET
  );

  try {
    const res = await cloudinary.uploader.upload(image.tempFilePath, {
      upload_preset: "chatting_app_preset",
      folder: "chattingApp",
    });
    return { public_id: res.public_id, url: res.url };
  } catch (err) {
    console.log(err);
  }
};
