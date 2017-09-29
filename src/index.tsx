import { FocusStyleManager } from '@blueprintjs/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
import './index.css';

FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
