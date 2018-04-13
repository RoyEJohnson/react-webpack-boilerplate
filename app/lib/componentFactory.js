/* eslint-disable */
import React from 'react';
import { observable, action } from 'mobx';
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
  return 'component' + hook.charAt(0).toUpperCase() + hook.substr(1);
}

function makeRealComponentIfNecessary(fnComponent, spec, context) {
  const hasHooks = hooks.some((h) => h in spec);

  if (!hasHooks) {
    return fnComponent;
  }

  class EsComponent extends React.Component {
  }

  EsComponent.prototype.render = fnComponent;
  hooks.forEach((name) => {
    if (name in spec) {
      EsComponent.prototype[hookToRealName(name)] = spec[name].bind(context);
    }
  });

  return EsComponent;
}

function componentFactory(spec) {
  return (props) => {
    const context = observable.object(spec.state());
    const fnComponent = spec.render.bind(context, props);
    const realComponent = makeRealComponentIfNecessary(fnComponent, spec, context);
    const Component = observer(realComponent);

    context.$elId = uniqueElId();
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
    });

    // checkPropTypes(spec.propTypes, props, 'prop', 'Component');

    // eslint-disable-next-line
    return new Component();
  };
}

export default componentFactory;
