import React, { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { useTask, TaskStatus } from "../contexts/TaskContext";
import Header from "../components/Header";
import TaskCard from "../components/TaskCard";
import CreateTaskForm from "../components/CreateTaskForm";

const Dashboard: React.FC = () => {
  const { isConnected, loading: web3Loading } = useWeb3();
  const {
    tasks,
    clientTasks,
    freelancerTasks,
    createTask,
    acceptTask,
    submitTask,
    approveTask,
    disputeTask,
    cancelTask,
    loading,
    error,
  } = useTask();

  const [activeTab, setActiveTab] = useState<"all" | "client" | "freelancer">(
    "all"
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  const displayedTasks =
    activeTab === "all"
      ? tasks
      : activeTab === "client"
      ? clientTasks
      : freelancerTasks;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {!isConnected && !web3Loading ? (
          <div className="text-center my-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to Task Escrow
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to create or accept tasks with secure payment
              escrow.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                Task Dashboard
              </h2>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {showCreateForm ? "Hide Form" : "Create Task"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {showCreateForm && (
              <div className="mb-8">
                <CreateTaskForm onSubmit={createTask} loading={loading} />
              </div>
            )}

            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`py-4 px-1 ${
                      activeTab === "all"
                        ? "border-b-2 border-indigo-500 text-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab("client")}
                    className={`py-4 px-1 ${
                      activeTab === "client"
                        ? "border-b-2 border-indigo-500 text-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    My Client Tasks
                  </button>
                  <button
                    onClick={() => setActiveTab("freelancer")}
                    className={`py-4 px-1 ${
                      activeTab === "freelancer"
                        ? "border-b-2 border-indigo-500 text-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    My Freelancer Tasks
                  </button>
                </nav>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : displayedTasks.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600">No tasks found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAccept={acceptTask}
                    onSubmit={submitTask}
                    onApprove={approveTask}
                    onDispute={disputeTask}
                    onCancel={cancelTask}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
