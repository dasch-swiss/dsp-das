import { TitleFromCamelCasePipe } from './title-from-camel-case.pipe';

describe('TitleFromCamelCasePipe', () => {
    it('create an instance', () => {
        const pipe = new TitleFromCamelCasePipe();
        expect(pipe).toBeTruthy();
    });
});
