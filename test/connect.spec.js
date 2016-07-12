import expect from 'expect';
import expectJSX from 'expect-jsx';
import TestUtils from 'react-addons-test-utils';
import React from 'react';

import Flaxs, { flaxs } from 'flaxs';
import { mapValues } from '../src/lodash';
import { connect } from '../src/';

expect.extend(expectJSX);

describe('React', () => {
  flaxs.store.mergeState('testing', {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
  });

  it('should have a flaxs store state ready', () => {
    expect(flaxs).toBeA(Flaxs);
    expect(flaxs.store.state).toNotBe(undefined);
    expect(flaxs.store.state.testing.one).toBe(1);
  });

  describe('connect', () => {
    const defaultConnector = connect(state => ({
      uno: state.testing.one,
      dos: state.testing.two,
      tres: state.testing.three,
    }));
    const otherConnector = connect(state => ({
      onePlusFour: state.testing.one + state.testing.four,
      two: state.testing.two,
    }), (stateProps, ownProps) => {
      const { factor } = ownProps;
      if (typeof factor === 'number') {
        return {
          ...mapValues(stateProps, prop => prop * factor),
        };
      }
      return { ...stateProps, factor: 1 };
    });
    const Table = () => <div>empty</div>;

    it('should inject connected props and own properly', () => {
      const renderer = TestUtils.createRenderer();
      const ConnectedComponent = defaultConnector(Table);
      renderer.render(
        <ConnectedComponent four={40} />
      );
      const output = renderer.getRenderOutput();
      expect(output).toEqualJSX(<Table four={40} dos={2} tres={3} uno={1} />);
    });

    it('should merge all injected props properly', () => {
      const renderer = TestUtils.createRenderer();
      const ConnectedComponent = otherConnector(Table);
      renderer.render(<ConnectedComponent factor={3} />);
      expect(renderer.getRenderOutput()).toEqualJSX(<Table onePlusFour={15} two={6} />);
      renderer.render(<ConnectedComponent factor={false} />);
      expect(renderer.getRenderOutput()).toEqualJSX(<Table onePlusFour={5} two={2} factor={1} />);
    });
  });
});
