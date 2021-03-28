import React from 'react';
import ReactDOM from 'react-dom';
import { SpeechProvider } from '@speechly/react-client';
import App from './App';
import './index.css';
import { Provider } from './context/context';

ReactDOM.render(
    <SpeechProvider appId="e0770858-2cd6-4825-baba-9fec8e84bcb9" language="en-US">
        <Provider>
            <App />
        </Provider>
    </SpeechProvider>,
    document.getElementById('root'),
);