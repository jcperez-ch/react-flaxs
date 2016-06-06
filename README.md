# react-flaxs

[![Build Status](https://travis-ci.org/jcperez-ch/react-flaxs.svg?branch=master)](https://travis-ci.org/jcperez-ch/react-flaxs)

Connect Flaxs implementation with your React application.

Simple way to connect to the master store in flaxs using a decorator pattern:

```javascript
@connect(state => ({
  ...state.something,
  somethingElse: state.else.something,
}))
export default class ConnectedComponent extends React.Component {

}
```
