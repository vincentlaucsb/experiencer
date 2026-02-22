/**
 * Convert URLs to <a href="" />
 * @param text
 */
export default function toUrl(text?: string) {
    if (text) {
        const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        return text.replace(expression, (url) => `[${url}](${url})`);
    }

    return "";
}