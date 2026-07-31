/**
 * Marks application editing fields as user-authored content rather than
 * credentials or personal-data forms.
 *
 * `autocomplete` is the browser-standard hint. The data attributes are
 * advisory exclusions understood by common password-manager extensions.
 */
export const nonCredentialInputAttributes = {
    autoComplete: "off",
    "data-form-type": "other",
    "data-lpignore": "true",
    "data-1p-ignore": "true",
    "data-op-ignore": "true",
    "data-bwignore": "true",
} as const;
