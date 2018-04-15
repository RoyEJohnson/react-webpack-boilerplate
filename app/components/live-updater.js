import React from 'react';
import PropTypes from 'prop-types';
import componentFactory from '../lib/componentFactory';

const LiveUpdater = componentFactory({
  propTypes: {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  },
  state() {
    return {
      updatesSent: 0,
      textInput: React.createRef()
    };
  },
  actions: {
    sendUpdate(event) {
      this.$props.onChange(event.target.value);
      this.updatesSent += 1;
    },
    focusTextInput() {
      this.textInput.current.focus();
    }
  },
  render(p) {
    return (
      <div>
        <h2>Live updater</h2>
        <div>Updates sent: {this.updatesSent}</div>
        Value:
        <input
          value={p.value}
          onChange={this.sendUpdate}
          onClick={this.focusTextInput}
        />
        <input type="text" ref={this.textInput} />
      </div>
    );
  }
});

export default LiveUpdater;
