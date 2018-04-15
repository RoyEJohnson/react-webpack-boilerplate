import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

function render(props) {
  return (
    <div>
      <h2>Delayed Updater</h2>
      <div>Updates sent: {props.updatesSent}</div>
      Value: <input value={props.localValue} onChange={props.onChange} />
      <button onClick={props.sendUpdate}>Send Update</button>
      <div>{props.msg}</div>
    </div>
  );
}

render.propTypes = {
  onChange: PropTypes.func.isRequired,
  updatesSent: PropTypes.number.isRequired,
  localValue: PropTypes.string.isRequired,
  sendUpdate: PropTypes.func.isRequired,
  msg: PropTypes.string.isRequired
};

const fnThatReturnsComponent = (initialProps) => {
  const state = observable({
    localValue: initialProps.value,
    updatesSent: 0,
    onChange: action((event) => {
      state.localValue = event.target.value;
    }),
    sendUpdate: action(() => {
      state.updatesSent += 1;
      initialProps.onChange(state.localValue);
    })
  });
  // eslint-disable-next-line
  const Component = observer((props) => {
    // Any props that get passed on would happen here, too
    return render(Object.assign({}, state));
  });
  let lastProps = initialProps;

  Component.prototype.componentWillReceiveProps = (nextProps) => {
    if (nextProps.value !== lastProps.value) {
      state.localValue = nextProps.value;
    }
    lastProps = nextProps;
  };

  return new Component();
};

export default fnThatReturnsComponent;
