import React from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../contexts/Web3Context";
import { TaskStatus } from "../contexts/TaskContext";

interface Task {
  id: number;
  client: string;
  freelancer: string;
  description: string;
  amount: string;
  deadline: number;
  status: TaskStatus;
  deliverableLink: string;
  createdAt: number;
}

interface TaskCardProps {
  task: Task;
  onAccept: (id: number) => void;
  onSubmit: (id: number, link: string) => void;
  onApprove: (id: number) => void;
  onDispute: (id: number) => void;
  onCancel: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onAccept,
  onSubmit,
  onApprove,
  onDispute,
  onCancel,
}) => {
  const { account } = useWeb3();
  const [deliverableLink, setDeliverableLink] = React.useState<string>("");

  const isClient =
    account && account.toLowerCase() === task.client.toLowerCase();
  const isFreelancer =
    account && account.toLowerCase() === task.freelancer.toLowerCase();
  const hasFreelancer =
    task.freelancer !== "0x0000000000000000000000000000000000000000";

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.Created:
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
            Open
          </span>
        );
      case TaskStatus.Accepted:
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
            In Progress
          </span>
        );
      case TaskStatus.Submitted:
        return (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
            Under Review
          </span>
        );
      case TaskStatus.Disputed:
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
            Disputed
          </span>
        );
      case TaskStatus.Completed:
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
            Completed
          </span>
        );
      case TaskStatus.Cancelled:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
            Unknown
          </span>
        );
    }
  };

  const handleSubmit = () => {
    if (deliverableLink.trim() === "") return;
    onSubmit(task.id, deliverableLink);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {task.description}
        </h3>
        {getStatusLabel(task.status)}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Amount:</p>
          <p className="font-medium">
            {ethers.utils.formatEther(task.amount)} ETH
          </p>
        </div>
        <div>
          <p className="text-gray-500">Deadline:</p>
          <p className="font-medium">{formatDate(task.deadline)}</p>
        </div>
        <div>
          <p className="text-gray-500">Client:</p>
          <p className="font-medium truncate">{`${task.client.slice(
            0,
            6
          )}...${task.client.slice(-4)}`}</p>
        </div>
        <div>
          <p className="text-gray-500">Freelancer:</p>
          <p className="font-medium">
            {hasFreelancer
              ? `${task.freelancer.slice(0, 6)}...${task.freelancer.slice(-4)}`
              : "Not assigned"}
          </p>
        </div>
      </div>

      {task.deliverableLink && (
        <div className="mb-4 p-2 bg-gray-50 rounded-md">
          <p className="text-gray-500 text-sm">Deliverable:</p>
          <a
            href={task.deliverableLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 break-all"
          >
            {task.deliverableLink}
          </a>
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        {task.status === TaskStatus.Created && !isClient && (
          <button
            onClick={() => onAccept(task.id)}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Accept Task
          </button>
        )}

        {task.status === TaskStatus.Created && isClient && (
          <button
            onClick={() => onCancel(task.id)}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Cancel Task
          </button>
        )}

        {task.status === TaskStatus.Accepted && isFreelancer && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter deliverable link"
              className="w-full px-3 py-2 border rounded-md"
              value={deliverableLink}
              onChange={(e) => setDeliverableLink(e.target.value)}
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit Work
            </button>
          </div>
        )}

        {task.status === TaskStatus.Submitted && isClient && (
          <div className="flex space-x-2">
            <button
              onClick={() => onApprove(task.id)}
              className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Approve & Pay
            </button>
            <button
              onClick={() => onDispute(task.id)}
              className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Dispute
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
