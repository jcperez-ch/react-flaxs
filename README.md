# react-flaxs

[![Build Status](https://travis-ci.org/jcperez-ch/react-flaxs.svg?branch=master)](https://travis-ci.org/jcperez-ch/react-flaxs)
[![npm version](https://img.shields.io/npm/v/react-flaxs.svg?style=flat-square)](https://www.npmjs.com/package/react-flaxs)

Connect Flaxs implementation with your React application.

### Connect Decorator

Simple way to connect to the master store in flaxs using a decorator pattern:

```javascript
import { connect } from 'react-flaxs';

@connect(state => ({
  ...state.something,
  somethingElse: state.else.something,
}))
export default class ConnectedComponent extends React.Component {

}
```

You can redefine the final props of your component based on the given props using a second connect function.
Example, let's say that if you want your component `ConnectedComponent` to ignore the `somethingElse` state if you specify a `ignore` attribute in the parent component using this form:

```javascript
@connect(mapMasterStateToProps, mapOwnProps)
```

Here an example:

```javascript
// ParentComponent
<ConnectedComponent ignore={true} />

// ConnectedComponent
import { connect } from 'react-flaxs';

@connect(state => ({
  ...state.something,
  somethingElse: state.else.something,
}), (stateProps, ownProps) => {
  const { somethingElse, ...otherStateProps } = stateProps;
  let finalProps = {
    ...otherStateProps,
  };
  if (!ownProps.ignore) {
    finalProps = {
      ...finalProps,
      somethingElse,
    };
  }
  return finalProps;
})
export default class ConnectedComponent extends React.Component {

}
```

### Multi Connect Decorator
If you are connecting states from stores outside the master store, then you might need a `multiConnector` (currently not available)

```javascript
import { connect } from 'react-flaxs';

@multiConnect(stores => ({
  ...stores.flags.state,
  user: stores.session.user.username,
  totalResults: stores.search.results.length
}), {
  flags: OptionsStore,
  session: SessionStore,
  search: SearchStore,
})
export default class ConnectedComponent extends React.Component {

}
```

You can specify the final props of your component based on the given props using a second connect function as a third parameter.

```javascript
@multiConnect(mapStateToProps, connectedStoresObject, mapOwnProps)
```
