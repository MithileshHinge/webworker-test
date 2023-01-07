import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import someComputation from './compute/someComputation';
import { workerManager } from './workerManager';

function App() {
  const [num, setNum] = useState(-1);
  useEffect(() => {
    const jobId = someComputation(setNum);
    return () => {
      workerManager.terminateJob(jobId);
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div>Progress: {Math.round(num * 10000)/100}%</div>
      </header>
    </div>
  );
}

export default App;
