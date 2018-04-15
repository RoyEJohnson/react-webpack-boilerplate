// /* eslint-disable */
import { observable, action, reaction, decorate, computed } from 'mobx';
import { observer } from 'mobx-react';
import { checkPropTypes } from 'prop-types';

let elIdCounter = 0;

function uniqueElId() {
  elIdCounter += 1;

  return elIdCounter;
}

const hooks = [
  'willMount', 'willReceiveProps', 'willUpdate', 'didUpdate',
  'didCatch', 'didMount', 'willUnmount', 'shouldUpdate'
];

function hookToRealName(hook) {
  if (hook.substr(0, 6) === 'should') {
    return hook.replace('should', 'shouldComponent');
  }
  return `component${hook.charAt(0).toUpperCase()}${hook.substr(1)}`;
}

function componentFactory(spec) {
  return (props) => {
    // eslint-disable-next-line
    const context = observable.object(spec.state(props));
    const fnComponent = (newProps) => {
      context.$props = newProps;
      return spec.render.bind(context)(newProps);
    };
    const Component = observer(fnComponent);

    hooks.forEach((name) => {
      if (name in spec) {
        Component.prototype[hookToRealName(name)] = spec[name].bind(context);
      }
    });
    context.$elId = uniqueElId();
    context.$props = props;
    Reflect.defineProperty(context, '$el', {
      get() {
        return document.querySelector(`[data-el-id="${context.$elId}"]`);
      }
    });

    Reflect.ownKeys((spec.actions || {})).forEach((name) => {
      context[name] = action(spec.actions[name]).bind(context);
    });

    Reflect.ownKeys((spec.computed || {})).forEach((name) => {
      const arg = spec.computed[name];
      const property =
        typeof arg === 'function' ?
          { get: arg.bind(context) } :
          { get: arg.get.bind(context), set: arg.set.bind(context) };

      Reflect.defineProperty(context, name, property);
      decorate(context, { name: computed });
    });

    Reflect.ownKeys((spec.watch || {})).forEach((name) => {
      reaction(() => context[name], spec.watch[name].bind(context));
    });

    checkPropTypes(spec.propTypes, props, 'prop', 'Component');

    return new Component();
  };
}

export default componentFactory;
