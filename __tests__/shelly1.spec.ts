import { Shelly1 } from '../src';

describe('Shelly1', () => {
  const host = 'localhost:7294';
  it('should access the instance', () => {
    const shelly1 = new Shelly1({ host });
    expect(shelly1).toBeInstanceOf(Shelly1);
  });
});
