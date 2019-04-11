import { KnexDbMixin } from '../index';

describe(`>> index <<`, () => {
  it('Should export KnexDbMixin', () => {
    expect(KnexDbMixin).toBeInstanceOf(Function);
  });
});
