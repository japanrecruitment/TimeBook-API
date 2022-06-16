import sharp, { Sharp } from "sharp";
import { Log } from ".";
import { ImageTypes } from "../functions/graphql/schema/media";

export interface ImageResizeParams {
    type: ImageTypes;
    quality?: number;
}

export interface ResizedImage {
    size: string;
    width: number;
    height: number;
    quality: number;
    image?: Buffer;
}

export class ImageProcessor {
    private _image: Sharp;
    private _isInitialized: boolean = false;
    private _origialWidth: number;
    private _origialHeight: number;
    private _aspectRatio: number;
    private _format: keyof sharp.FormatEnum;

    public async init(data: Buffer): Promise<void> {
        try {
            // setup image from Buffer data
            this._image = sharp(data);
            // obtain metadata
            const { width, height, format } = await this._image.metadata();
            this._origialWidth = width;
            this._origialHeight = height;
            this._format = format;
            this._aspectRatio = width > height ? height / width : width / height;
            this._isInitialized = true;
        } catch (error) {
            console.log("Error while retrieving metadata:", error.message);
        }
    }

    public async resize({ type, quality = 80 }: ImageResizeParams): Promise<ResizedImage[]> {
        if (!this._isInitialized) throw new Error("Error with image data or instance not initialized.");

        try {
            // prepare sizes for resize
            const size = this.imageSize({ type, quality });

            // create resizing promise
            const resizing = size.map((size) => {
                return this.doResize(size);
            });

            // Process all resizing concurrently
            const resizedImage = await Promise.all(resizing);

            // Map all images with resized image data
            return size.map((size, index) => ({ ...size, image: resizedImage[index] }));
        } catch (error) {
            Log("Error at ImageProcessor.resize", error.message);
            return error;
        }
    }

    private imageSize({ type, quality }: ImageResizeParams): ResizedImage[] {
        switch (type) {
            case "Profile":
                return [
                    { size: "large", width: 1000, height: 1000, quality },
                    { size: "medium", width: 500, height: 500, quality },
                    { size: "small", width: 250, height: 250, quality },
                    { size: "thumbnail", width: 100, height: 100, quality: 50 },
                ];
            case "Cover":
                return [
                    { size: "large", width: 1770, height: 1000, quality },
                    { size: "medium", width: 885, height: 500, quality },
                    { size: "small", width: 442, height: 250, quality },
                    { size: "thumbnail", width: 177, height: 100, quality: 50 },
                ];
            default:
                return [
                    {
                        size: "large",
                        width: 1000,
                        height: Math.floor(1000 * this._aspectRatio),
                        quality,
                    },
                    {
                        size: "medium",
                        width: 500,
                        height: Math.floor(500 * this._aspectRatio),
                        quality,
                    },
                    {
                        size: "small",
                        width: 250,
                        height: Math.floor(250 * this._aspectRatio),
                        quality,
                    },
                    {
                        size: "thumbnail",
                        width: Math.floor(100 / this._aspectRatio),
                        height: 100,
                        quality: 50,
                    },
                ];
        }
    }

    private async doResize({ width, height, quality }: ResizedImage): Promise<Buffer> {
        if (!this._isInitialized) throw new Error("Error with image data or instance not initialized.");
        try {
            // make a copy of image
            const currentSize = this._image;
            return currentSize.resize({ width, height, fit: "cover" }).jpeg({ quality, progressive: true }).toBuffer();
        } catch (error) {
            Log("Error at ImageProcessor.doResize", error.message);
            return error;
        }
    }
}
