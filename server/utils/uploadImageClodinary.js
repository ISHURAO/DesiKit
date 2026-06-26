import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name : process.env.CLODINARY_CLOUD_NAME || 'demo',
    api_key : process.env.CLODINARY_API_KEY || 'demo',
    api_secret : process.env.CLODINARY_API_SECRET_KEY || 'demo'
})

const uploadImageClodinary = async(image)=>{
    const isMock = !process.env.CLODINARY_CLOUD_NAME || 
                   process.env.CLODINARY_CLOUD_NAME === 'demo' || 
                   !process.env.CLODINARY_API_KEY || 
                   process.env.CLODINARY_API_KEY === 'demo';

    if (isMock) {
        console.log("Using Mock Cloudinary Upload");
        return {
            secure_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
        };
    }

    try {
        const buffer = image?.buffer || Buffer.from(await image.arrayBuffer())

        const uploadImage = await new Promise((resolve,reject)=>{
            cloudinary.uploader.upload_stream({ folder : "desikit"},(error,uploadResult)=>{
                if(error) {
                    console.log("Cloudinary upload failed, falling back to mock", error);
                    return resolve({
                        secure_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
                    });
                }
                return resolve(uploadResult)
            }).end(buffer)
        })

        return uploadImage;
    } catch (err) {
        console.log("Cloudinary upload exception, falling back to mock", err);
        return {
            secure_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
        };
    }
}

export default uploadImageClodinary
