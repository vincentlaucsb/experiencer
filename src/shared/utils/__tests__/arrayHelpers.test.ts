import { deleteAt, moveDown, moveUp, pushArray } from '@/shared/utils/arrayHelpers';

describe('immutable array helpers', () => {
    test('deleteAt leaves the source array unchanged', () => {
        const source = ['one', 'two', 'three'];

        expect(deleteAt(source, 1)).toEqual(['one', 'three']);
        expect(source).toEqual(['one', 'two', 'three']);
    });

    test('move helpers leave the source array unchanged', () => {
        const source = ['one', 'two', 'three'];

        expect(moveUp(source, 1)).toEqual(['two', 'one', 'three']);
        expect(moveDown(source, 1)).toEqual(['one', 'three', 'two']);
        expect(source).toEqual(['one', 'two', 'three']);
    });

    test('pushArray leaves the source array unchanged', () => {
        const source = ['one'];

        expect(pushArray(source, 'two')).toEqual(['one', 'two']);
        expect(source).toEqual(['one']);
    });
});
