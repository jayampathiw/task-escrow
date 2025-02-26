import React, { useState } from "react";
import { ethers } from "ethers";

interface CreateTaskFormProps {
  onSubmit: (description: string, deadline: number, amount: string) => void;
  loading: boolean;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onSubmit,
  loading,
}) => {
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !deadline || !amount) return;

    // Convert deadline to unix timestamp
    const deadlineDate = new Date(deadline);
    const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);

    // Submit form
    onSubmit(description, deadlineTimestamp, amount);

    // Reset form
    setDescription("");
    setDeadline("");
    setAmount("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Create New Task
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Task Description
          </label>
          <textarea
            id="description"
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="Describe the task in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label
            htmlFor="deadline"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Deadline
          </label>
          <input
            id="deadline"
            type="date"
            className="w-full px-3 py-2 border rounded-md"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]} // Set min date to today
            required
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Amount (ETH)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.001"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </div>
  );
};

export default CreateTaskForm;
