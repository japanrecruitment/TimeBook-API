export default function convertToJST(date) {
    return new Date(
        (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
    );
}
