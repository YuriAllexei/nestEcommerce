import { Request } from "express";


export const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {

    if (!file) return cb(new Error('No file found'), false);

    const fileExtension = file.mimetype.split('/')[1];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    }
    cb(null, false);
}
