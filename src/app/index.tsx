import { createRoot } from 'react-dom/client';
import registerNodes from '@/resume/schema';
import Resume from './Resume';
// import * as serviceWorker from './serviceWorker';

registerNodes();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Resume />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();