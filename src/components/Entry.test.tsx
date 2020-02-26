/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import Entry from "./Entry";
import React from "react";

/** Assert that the correct class names are generated */
test('Entry Class Names Test', async () => {
    const title = ["Some Company"];
    const subtitle = ["Some Job Title", "Some Town, USA", "2016"];

    const { container } = render(<Entry
        id={[0]}
        type={Entry.type}
        uuid=""
        isLast={false}
        updateData={() => { }}
        title={title}
        subtitle={subtitle}
    />);

    const subtitleContainer = container.querySelector('.subtitle') as Element;

    const allSubtitleFields = subtitleContainer.querySelectorAll('.field');
    expect(allSubtitleFields).not.toBeNull();

    if (allSubtitleFields) {
        expect(allSubtitleFields.length === subtitle.length);
    }

    const firstField = subtitleContainer.querySelector('.field-0');
    expect(firstField).not.toBeNull();

    if (firstField) {
        expect(firstField.textContent).toBe("Some Job Title");
    }

    const middleField = subtitleContainer.querySelector('.field.field-middle');
    expect(middleField).not.toBeNull();

    if (middleField) {
        expect(middleField.textContent).toBe("Some Town, USA");
    }

    const lastField = subtitleContainer.querySelector('.field.field-last');
    expect(lastField).not.toBeNull();

    if (lastField) {
        expect(lastField.textContent).toBe("2016");
    }
})