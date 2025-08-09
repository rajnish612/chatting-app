import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const upload = async (audioBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",

        upload_preset: "chatting_app_preset",
        folder: "chattingApp",
      },
      (error, result) => {
        if (error) return reject(error);
        

        return resolve({ public_id: result.public_id, url: result.secure_url });
      }
    );
    stream.end(audioBuffer);
  });
};
