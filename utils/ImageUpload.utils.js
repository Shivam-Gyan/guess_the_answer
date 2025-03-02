import cloudinary from 'cloudinary'


 async function UplaodCloudinary(req, res){

    if (!req.files || Object.keys(req.files).length == 0) {
        return next(new ErrorHandler("Please uplaod and image", 404));
    }
    const { image } = req.files;
    let cloudinaryResponse;

    try {
        cloudinaryResponse = await cloudinary.uploader.upload(
            image.tempFilePath
        );
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            success: false
        })
    }


    return res.status(200).json({
        success: true,
        message: "upload successfull",
        image_url: cloudinaryResponse.secure_url
    })
}

export default UplaodCloudinary;