import registerNodes from '@/resume/schema';
import { createResumeDocumentSource, prepareResumeDocument } from '@/shared/resumeDocument/prepareResumeDocument';
import { renderResumeMarkup } from '@/shared/resumeDocument/renderResumeMarkup';
import ResumeTemplates from '@/templates/ResumeTemplates';

registerNodes();

const portrait = { type: 'Image', value: 'https://portrait.example/applicant.png', altText: 'Portrait of a synthetic applicant' };

test.each(['isolated-preview', 'print', 'export', 'png', 'render-service', 'public-review'] as const)(
    '%s keeps decorative contact icons silent and meaningful image alternatives intact', async target => {
        const data = { ...ResumeTemplates.templates.Assured,
            childNodes: [...ResumeTemplates.templates.Assured.childNodes, portrait] };
        const markup = await renderResumeMarkup(prepareResumeDocument(createResumeDocumentSource(data, 'Contact accessibility'), target));
        const host = document.createElement('div');
        host.innerHTML = markup;
        const icons = host.querySelectorAll('img.icon');
        expect(icons).toHaveLength(6);
        icons.forEach(icon => expect(icon.getAttribute('alt')).toBe(''));
        expect(host.querySelector('img.resume-image')?.getAttribute('alt')).toBe(portrait.altText);
        expect(host.textContent).toContain('mynameis@mail.com');
        expect(host.textContent).toContain('(123) 456-7890');
    }
);
