import { stringify } from 'query-string';
import { SHA1 } from 'crypto-js'
import axios from 'axios';

export async function uploadToCloudinary(file: File) {
  const apiSecrect = process.env.REACT_APP_CLOUDINARY_API_SECRECT;
  const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const timestamp = new Date().getTime();

  const params = {
    folder: "THE_TNV",
    timestamp: timestamp,
    unique_filename: false,
    use_filename: true
  }
  const paramsString = stringify(params);
  const paramsStringWithSecrect = paramsString + apiSecrect;
  const signature = SHA1(paramsStringWithSecrect).toString();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", timestamp + "");
  formData.append("api_key", apiKey);
  formData.append("signature", signature);
  formData.append("unique_filename", "false");
  formData.append("use_filename", "true");
  formData.append("folder", "THE_TNV");

  return axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
}