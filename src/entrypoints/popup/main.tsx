import './style.css';
import ReactDOM from 'react-dom/client';
import PopupApp from './PopupApp';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

ReactDOM.createRoot(container).render(<PopupApp />);
