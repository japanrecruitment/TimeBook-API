export default {
    type: "object",
    properties: {
        photoId: { type: "string" },
        processedImages: { type: "array" },
    },
    required: ["photoId", "processedImages"],
} as const;
