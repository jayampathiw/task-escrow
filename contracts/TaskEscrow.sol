// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

 enum TaskStatus {
    Created,
    Accepted,
    Submitted,
    Approved,
    Disputed,
    Completed,
    Cancelled
}

struct Task {
    uint256 id;
    address payable client;
    address payable freelancer;
    string description;
    uint256 amount;
    uint256 deadline;
    TaskStatus status;
    string deliverableLink;
    uint256 createdAt;
}

contract TaskEscrow {

    uint256 private taskIdCounter;
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public clientTasks;
    mapping(address => uint256[]) public freelancerTasks;

    event TaskCreated(
        uint256 taskId,
        address client,
        string description,
        uint256 amount,
        uint256 deadline
    );
    event TaskAccepted(uint256 taskId, address freelancer);
    event TaskSubmitted(uint256 taskId, string deliverableLink);
    event TaskApproved(uint256 taskId);
    event TaskDisputed(uint256 taskId);
    event TaskCompleted(uint256 taskId, address freelancer, uint256 amount);
    event TaskCancelled(uint256 taskId);

    modifier onlyClient(uint256 _taskId) {
        require(
            tasks[_taskId].client == msg.sender,
            "Only the client can call this function"
        );
        _;
    }

    modifier onlyFreelancer(uint256 _taskId) {
        require(
            tasks[_taskId].freelancer == msg.sender,
            "Only the freelancer can call this function"
        );
        _;
    }

    modifier taskExists(uint256 _taskId) {
        require(_taskId < taskIdCounter, "Task does not exist");
        _;
    }

    function createTask(
        string memory _description,
        uint256 _deadline
    ) external payable returns (uint256) {
        require(msg.value > 0, "Task payment must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 taskId = taskIdCounter++;
        
        tasks[taskId] = Task({
            id: taskId,
            client: payable(msg.sender),
            freelancer: payable(address(0)),
            description: _description,
            amount: msg.value,
            deadline: _deadline,
            status: TaskStatus.Created,
            deliverableLink: "",
            createdAt: block.timestamp
        });

        clientTasks[msg.sender].push(taskId);

        emit TaskCreated(
            taskId,
            msg.sender,
            _description,
            msg.value,
            _deadline
        );

        return taskId;
    }

    function acceptTask(uint256 _taskId) external taskExists(_taskId) {
        Task storage task = tasks[_taskId];
        
        require(
            task.status == TaskStatus.Created,
            "Task is not available for acceptance"
        );
        require(
            task.client != msg.sender,
            "Client cannot accept their own task"
        );

        task.freelancer = payable(msg.sender);
        task.status = TaskStatus.Accepted;
        
        freelancerTasks[msg.sender].push(_taskId);

        emit TaskAccepted(_taskId, msg.sender);
    }

    function submitTask(
        uint256 _taskId,
        string memory _deliverableLink
    ) external taskExists(_taskId) onlyFreelancer(_taskId) {
        Task storage task = tasks[_taskId];
        
        require(
            task.status == TaskStatus.Accepted,
            "Task must be in accepted state"
        );
        require(bytes(_deliverableLink).length > 0, "Deliverable link cannot be empty");

        task.deliverableLink = _deliverableLink;
        task.status = TaskStatus.Submitted;

        emit TaskSubmitted(_taskId, _deliverableLink);
    }

    function approveTask(
        uint256 _taskId
    ) external taskExists(_taskId) onlyClient(_taskId) {
        Task storage task = tasks[_taskId];
        
        require(
            task.status == TaskStatus.Submitted,
            "Task must be in submitted state"
        );

        task.status = TaskStatus.Approved;
        
        (bool success, ) = task.freelancer.call{value: task.amount}("");
        require(success, "Payment transfer failed");
        
        task.status = TaskStatus.Completed;

        emit TaskApproved(_taskId);
        emit TaskCompleted(_taskId, task.freelancer, task.amount);
    }

    function disputeTask(
        uint256 _taskId
    ) external taskExists(_taskId) onlyClient(_taskId) {
        Task storage task = tasks[_taskId];
        
        require(
            task.status == TaskStatus.Submitted,
            "Task must be in submitted state"
        );

        task.status = TaskStatus.Disputed;

        emit TaskDisputed(_taskId);
    }

    function cancelTask(
        uint256 _taskId
    ) external taskExists(_taskId) onlyClient(_taskId) {
        Task storage task = tasks[_taskId];
        
        require(
            task.status == TaskStatus.Created,
            "Only unaccepted tasks can be cancelled"
        );

        task.status = TaskStatus.Cancelled;
        
        (bool success, ) = task.client.call{value: task.amount}("");
        require(success, "Refund transfer failed");

        emit TaskCancelled(_taskId);
    }

    function getTask(uint256 _taskId) external view taskExists(_taskId) returns (Task memory) {
        return tasks[_taskId];
    }

    function getClientTasks() external view returns (uint256[] memory) {
        return clientTasks[msg.sender];
    }

    function getFreelancerTasks() external view returns (uint256[] memory) {
        return freelancerTasks[msg.sender];
    }

    function getTaskCount() external view returns (uint256) {
        return taskIdCounter;
    }
}