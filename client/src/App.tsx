import React from "react";
import { Web3Provider } from "./contexts/Web3Context";
import { TaskProvider } from "./contexts/TaskContext";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Web3Provider>
      <TaskProvider>
        <Dashboard />
      </TaskProvider>
    </Web3Provider>
  );
}

export default App;
