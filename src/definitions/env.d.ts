declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_CLOUDINARY_CLOUD_NAME: string,
      REACT_APP_CLOUDINARY_API_KEY: string,
      REACT_APP_CLOUDINARY_API_SECRECT: string
    }
  }
}

export {}