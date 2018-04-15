/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { observable, action, reaction, decorate, computed } from 'mobx';
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

const state = observable({
  localValue: 'State value'
});

const Component = observer((props) => {
  console.debug("Got props:", props);
  const stateAsProps = {
    onChange() { console.debug("On change!"); },
    updatesSent: 0,
    localValue: state.localValue,
    sendUpdate() { console.debug("Send update!"); },
    msg: 'The messagge'
  };
  return render(stateAsProps);
});

export default Component;
