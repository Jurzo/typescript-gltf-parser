import React, { ReactElement, useEffect } from 'react';
import './App.css';
import * as TSE from './bin/TSE';

function App(): ReactElement {
  const e = new TSE.Engine();

  useEffect(()=> {
    e.start();
  }, []);
  
  return (
    <div id="container">
      
    </div>
  );
}

export default App;
