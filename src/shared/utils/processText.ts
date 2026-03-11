export function process(text?: string) {
    if (text) {
        // Replace '--' with en dash and '---' with em dash
        return text.replace(/---/g, '\u2014').replace(/--/g, '\u2013');
    }

    return "";
}
