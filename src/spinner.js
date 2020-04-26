'use strict';

import React from 'react';
import { Spinner } from 'spin.js/spin';

class ReactSpinner extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('componentDidMount');
    //    this.container = React.createElement('div', { ref: 'container' });
    //    console.log(this.container);
    this.spinner = new Spinner(this.props.config);
    if (this.props.show) {
      this.spinner.spin(this.refs.container);
    }
  }

  componentWillReceiveProps(newProps) {
    console.log('componentWillReceiveProps');
    if (!newProps.show && this.props.show) {
      this.spinner.stop();
    } else if (newProps.show && !this.props.show) {
      this.spinner.spin(this.refs.container);
    }
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
    this.spinner.stop();
  }

  render() {
    console.log('render');
    // console.log(this.container);
    return React.createElement('div', { ref: 'container' });

    //return <div ref={this.divRef} />;
  }
}

export default ReactSpinner;
