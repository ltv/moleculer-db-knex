import { MoleculerKnexDbMixin } from '../index';

describe(`>> index <<`, () => {
  it('Should export MoleculerKnexDbMixin', () => {
    expect(MoleculerKnexDbMixin).toBeInstanceOf(Function);
  });
});
