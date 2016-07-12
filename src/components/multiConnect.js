import React, { Component } from 'react';
import { assign, forEach, identity, includes, isEmpty, omitBy, reduce, some } from '../lodash';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { flaxs } from 'flaxs';

/**
 * Took it from connect module in redux.
 * @param  {ReactElement} WrappedComponent
 * @return {String}
 */
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

/**
 * Default fuction that maps the props generated by 'mapStateToProps' function and
 * the actual props of the component.
 * @param  {object} mapedStateToProps
 * @param  {object} ownProps
 * @return {object}
 */
const defaultMapOwnProps = (stateProps, ownProps) => ({
  ...stateProps,
  ...ownProps,
});

export default function connect(
  mapStateToProps = identity,
  connectedStores = {},
  mapOwnProps = defaultMapOwnProps
) {
  if (process.env.NODE_ENV !== 'production' && isEmpty(connectedStores)) {
    /* eslint-disable no-console */
    console.error(`You need to connect your stores in the second attribute
      of the multiConnect decorator`);
    /* eslint-enable no-console */
    return ReactClass => ReactClass;
  }
  return function connection(ReactClass) {
    class Connection extends Component {
      static displayName = `multi(${getDisplayName(ReactClass)})`;
      constructor(props, context) {
        super(props, context);
        this.state = this.getConnectedProps();
        this.storeDidChange = this.storeDidChange.bind(this);
      }
      componentDidMount() {
        flaxs.store.addChangeListener(this.storeDidChange);
        forEach(connectedStores, store => {
          store.addChangeListener(this.storeDidChange);
        });
        this.isComponentMounted = true;
      }
      shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (
          nextContext !== this.context ||
          some(nextState, (nextProp, propKey) => nextProp !== this.state[propKey]) ||
          some(nextProps, (nextProp, propKey) => nextProp !== this.props[propKey])
        );
      }
      componentWillUnmount() {
        flaxs.store.removeChangeListener(this.storeDidChange);
        forEach(connectedStores, store => {
          store.removeChangeListener(this.storeDidChange);
        });
        this.isComponentMounted = false;
      }
      getConnectedProps(props = this.props, state = this.getMountedState()) {
        return mapOwnProps(mapStateToProps(state), props);
      }
      getMountedState() {
        return reduce(connectedStores, (accStores, store, storeKey) => {
          const { state, ...storeAttributes } = store;
          return assign(accStores, {
            [storeKey]: {
              ...omitBy(storeAttributes, (attr, key) => (
                includes(['on', 'once', 'mixin', 'callback', 'emit'], key)
              )),
              ...state,
            },
          });
        }, { ...flaxs.store.state });
      }
      storeDidChange() {
        // FIXME since events occur asynchronously, we can have the case where the component
        // listens for a change in the store, but the change occurs after it gets unmounted.
        if (this.isComponentMounted) {
          this.setState(this.getConnectedProps());
        }
      }
      render() {
        return React.createElement(ReactClass, this.getConnectedProps());
      }
    }

    return hoistNonReactStatics(Connection, ReactClass);
  };
}
