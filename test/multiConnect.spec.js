import expect from 'expect';
import expectJSX from 'expect-jsx';
import TestUtils from 'react-addons-test-utils';
import React from 'react';
import { pickBy, startsWith } from 'lodash';

import { flaxs } from 'flaxs';
import { multiConnect } from '../src/';

expect.extend(expectJSX);

describe('React', () => {
  flaxs.store.mergeState('testing', {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
  });

  const sessionStore = flaxs.createStore({
    getUser: () => sessionStore.state.user.username,
    isMocked: () => !sessionStore.state.user.isReal,
  }, () => true, {
    user: {
      username: 'flaxs',
      expires: 'never',
      isReal: false,
    },
  });

  const optionsStore = flaxs.createStore({
    isUserLoggedIn: () => optionsStore.state.skipLogin || !!sessionStore.getUser(),
  }, () => true, {
    options: {
      skipLogin: false,
      randomNumber: 10,
    },
  });

  describe('multiConnect', () => {
    let MyConnectedComponent;
    let renderer;

    beforeEach(() => {
      MyConnectedComponent = () => <div>empty</div>;
      renderer = TestUtils.createRenderer();
    });

    it('should have a flaxs store state ready', () => {
      expect(sessionStore.state).toNotBe(undefined);
      expect(optionsStore.state).toNotBe(undefined);
      expect(optionsStore.state.options.randomNumber).toBe(10);
    });

    const defaultConnector = multiConnect(state => ({
      isReal: state.session.user.isReal,
      skipLogin: state.options.options.skipLogin,
    }), {
      session: sessionStore,
      options: optionsStore,
    });

    const otherConnector = multiConnect(state => ({
      isReal: !state.session.isMocked(),
      skipLogin: state.options.options.skipLogin,
    }), {
      session: sessionStore,
      options: optionsStore,
    }, (stateProps, ownProps) => {
      const { skipLogin } = stateProps;
      if (skipLogin) {
        return {
          ...pickBy(ownProps, (prop, key) => startsWith(key, 'skip')),
        };
      }
      return { ...stateProps, noSkip: true };
    });

    it('should inject connected props and own properly', () => {
      const ConnectedComponent = defaultConnector(MyConnectedComponent);
      renderer.render(
        <ConnectedComponent />
      );
      expect(renderer.getRenderOutput()).toEqualJSX(<MyConnectedComponent />);
    });

    it('should inject connected props and own properly again', () => {
      sessionStore.mergeState('user', {
        ...sessionStore.state.user,
        isReal: true,
      });
      const ConnectedComponent = defaultConnector(MyConnectedComponent);
      renderer.render(
        <ConnectedComponent />
      );
      expect(renderer.getRenderOutput()).toEqualJSX(<MyConnectedComponent isReal />);
    });

    it('should merge ownProps to stateProps properly', () => {
      const ConnectedComponent = otherConnector(MyConnectedComponent);
      renderer.render(
        <ConnectedComponent skipThis="skipThis" skipThat="skipThat" dontSkip="dontSkip" />
      );
      expect(renderer.getRenderOutput()).toEqualJSX(
        <MyConnectedComponent noSkip isReal />
      );
      optionsStore.mergeState('options', {
        ...optionsStore.state.options,
        skipLogin: true,
      });
    });

    it('should throw an immutable exception if trying to modify any attribute of the store', () => {
      expect(() => {
        optionsStore.state.options = {};
      }).toThrow(/read only/);
    });
  });
});
