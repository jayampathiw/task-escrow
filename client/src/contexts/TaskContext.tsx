import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./Web3Context";

// Task status enum that mirrors the contract
enum TaskStatus {
  Created,
  Accepted,
  Submitted,
  Approved,
  Disputed,
  Completed,
  Cancelled,
}

interface Task {
  id: number;
  client: string;
  freelancer: string;
  description: string;
  amount: string; // ethers in wei
  deadline: number; // timestamp
  status: TaskStatus;
  deliverableLink: string;
  createdAt: number; // timestamp
}

interface TaskContextType {
  tasks: Task[];
  clientTasks: Task[];
  freelancerTasks: Task[];
  createTask: (
    description: string,
    deadline: number,
    amount: string
  ) => Promise<void>;
  acceptTask: (taskId: number) => Promise<void>;
  submitTask: (taskId: number, deliverableLink: string) => Promise<void>;
  approveTask: (taskId: number) => Promise<void>;
  disputeTask: (taskId: number) => Promise<void>;
  cancelTask: (taskId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { contract, account, signer, isConnected } = useWeb3();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [freelancerTasks, setFreelancerTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && contract) {
      fetchTasks();
    }
  }, [isConnected, contract, account]);

  const fetchTasks = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);

      // Get client tasks - log what we get
      const clientTaskIds = await contract.getClientTasks();
      console.log("Client task IDs:", clientTaskIds);

      // Get freelancer tasks - log what we get
      const freelancerTaskIds = await contract.getFreelancerTasks();
      console.log("Freelancer task IDs:", freelancerTaskIds);

      // Get total task count
      const taskCount = await contract.getTaskCount();
      const count = taskCount.toNumber();
      console.log("Total task count:", count);

      if (count === 0) {
        setTasks([]);
        setClientTasks([]);
        setFreelancerTasks([]);
        setLoading(false);
        return;
      }

      // Instead of relying solely on getClientTasks/getFreelancerTasks,
      // let's fetch all tasks directly using their IDs
      const allTasksPromises = [];
      for (let i = 0; i < count; i++) {
        allTasksPromises.push(contract.getTask(i));
      }

      const allTasksData = await Promise.all(allTasksPromises);
      const formattedAllTasks = allTasksData.map(formatTask);

      console.log("All tasks:", formattedAllTasks);

      // Filter for client and freelancer tasks
      const myClientTasks = formattedAllTasks.filter(
        (task) => task.client.toLowerCase() === account.toLowerCase()
      );

      const myFreelancerTasks = formattedAllTasks.filter(
        (task) =>
          task.freelancer.toLowerCase() === account.toLowerCase() &&
          task.freelancer !== "0x0000000000000000000000000000000000000000"
      );

      // Set state
      setTasks(formattedAllTasks);
      setClientTasks(myClientTasks);
      setFreelancerTasks(myFreelancerTasks);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching tasks", err);
      setError("Failed to fetch tasks. Please try again.");
      setLoading(false);
    }
  };

  const formatTask = (task: any): Task => {
    return {
      id: task.id.toNumber(),
      client: task.client,
      freelancer: task.freelancer,
      description: task.description,
      amount: task.amount.toString(),
      deadline: task.deadline.toNumber(),
      status: task.status,
      deliverableLink: task.deliverableLink,
      createdAt: task.createdAt.toNumber(),
    };
  };

  const createTask = async (
    description: string,
    deadline: number,
    amount: string
  ) => {
    if (!contract || !signer) {
      setError("Wallet not connected.");
      return;
    }

    try {
      setLoading(true);
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.createTask(description, deadline, {
        value: ethers.utils.parseEther(amount),
      });

      await tx.wait();
      await fetchTasks();
      setLoading(false);
    } catch (err) {
      console.error("Error creating task", err);
      setError("Failed to create task. Please try again.");
      setLoading(false);
    }
  };

  const acceptTask = async (taskId: number) => {
    if (!contract || !signer) {
      setError("Wallet not connected.");
      return;
    }

    try {
      setLoading(true);
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.acceptTask(taskId);
      await tx.wait();

      await fetchTasks();
      setLoading(false);
    } catch (err) {
      console.error("Error accepting task", err);
      setError("Failed to accept task. Please try again.");
      setLoading(false);
    }
  };

  const submitTask = async (taskId: number, deliverableLink: string) => {
    if (!contract || !signer) {
      setError("Wallet not connected.");
      return;
    }

    try {
      setLoading(true);
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.submitTask(taskId, deliverableLink);
      await tx.wait();

      await fetchTasks();
      setLoading(false);
    } catch (err) {
      console.error("Error submitting task", err);
      setError("Failed to submit task. Please try again.");
      setLoading(false);
    }
  };

  const approveTask = async (taskId: number) => {
    if (!contract || !signer) {
      setError("Wallet not connected.");
      return;
    }

    try {
      setLoading(true);
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.approveTask(taskId);
      await tx.wait();

      await fetchTasks();
      setLoading(false);
    } catch (err) {
      console.error("Error approving task", err);
      setError("Failed to approve task. Please try again.");
      setLoading(false);
    }
  };

  const disputeTask = async (taskId: number) => {
    if (!contract || !signer) {
      setError("Wallet not connected.");
      return;
    }

    try {
      setLoading(true);
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.disputeTask(taskId);
      await tx.wait();

      await fetchTasks();
      setLoading(false);
    } catch (err) {
      console.error("Error disputing task", err);
      setError("Failed to dispute task. Please try again.");
      setLoading(false);
    }
  };

  const cancelTask = async (taskId: number) => {
    if (!contract || !signer) {
      setError("Wallet not connected.");
      return;
    }

    try {
      setLoading(true);
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.cancelTask(taskId);
      await tx.wait();

      await fetchTasks();
      setLoading(false);
    } catch (err) {
      console.error("Error cancelling task", err);
      setError("Failed to cancel task. Please try again.");
      setLoading(false);
    }
  };

  const value = {
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
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};

export { TaskStatus };
