import expect from 'expect';
import Flaxs, { createStore } from 'flaxs';

describe('React', () => {
  const flaxs = createStore({
    testing: false,
  });
  describe('connect', () => {
    it('should have a flaxs store state ready', () => {
      expect(flaxs).toBeA(Flaxs);
      expect(flaxs.store.state).toNotBe(undefined);
    });
  });
});
