const TaskEscrow = artifacts.require("TaskEscrow");
const { BN, expectRevert, time } = require("@openzeppelin/test-helpers");

contract("TaskEscrow", (accounts) => {
  const [owner, client, freelancer] = accounts;
  let taskEscrow;
  const oneEther = web3.utils.toWei("1", "ether");
  const taskDescription = "Create a website landing page";
  let taskId;

  beforeEach(async () => {
    taskEscrow = await TaskEscrow.new();
  });

  it("should create a task", async () => {
    const deadline = (await time.latest()).add(time.duration.days(7));
    const tx = await taskEscrow.createTask(taskDescription, deadline, {
      from: client,
      value: oneEther,
    });

    taskId = tx.logs[0].args.taskId.toNumber();

    const task = await taskEscrow.getTask(taskId);
    assert.equal(task.client, client, "Client address doesn't match");
    assert.equal(
      task.description,
      taskDescription,
      "Task description doesn't match"
    );
    assert.equal(task.amount, oneEther, "Task amount doesn't match");
    assert.equal(task.status, 0, "Task status should be Created");
  });

  it("should allow freelancer to accept a task", async () => {
    // Create task first
    const deadline = (await time.latest()).add(time.duration.days(7));
    const tx = await taskEscrow.createTask(taskDescription, deadline, {
      from: client,
      value: oneEther,
    });
    taskId = tx.logs[0].args.taskId.toNumber();

    // Accept task
    await taskEscrow.acceptTask(taskId, { from: freelancer });

    const task = await taskEscrow.getTask(taskId);
    assert.equal(
      task.freelancer,
      freelancer,
      "Freelancer address doesn't match"
    );
    assert.equal(task.status, 1, "Task status should be Accepted");
  });

  it("should not allow client to accept their own task", async () => {
    // Create task first
    const deadline = (await time.latest()).add(time.duration.days(7));
    const tx = await taskEscrow.createTask(taskDescription, deadline, {
      from: client,
      value: oneEther,
    });
    taskId = tx.logs[0].args.taskId.toNumber();

    // Try to accept own task
    await expectRevert(
      taskEscrow.acceptTask(taskId, { from: client }),
      "Client cannot accept their own task"
    );
  });

  it("should allow freelancer to submit work", async () => {
    // Create and accept task first
    const deadline = (await time.latest()).add(time.duration.days(7));
    const tx = await taskEscrow.createTask(taskDescription, deadline, {
      from: client,
      value: oneEther,
    });
    taskId = tx.logs[0].args.taskId.toNumber();
    await taskEscrow.acceptTask(taskId, { from: freelancer });

    // Submit work
    const deliverableLink = "https://github.com/myrepo/landing-page";
    await taskEscrow.submitTask(taskId, deliverableLink, { from: freelancer });

    const task = await taskEscrow.getTask(taskId);
    assert.equal(
      task.deliverableLink,
      deliverableLink,
      "Deliverable link doesn't match"
    );
    assert.equal(task.status, 2, "Task status should be Submitted");
  });

  it("should allow client to approve work and pay freelancer", async () => {
    // Create, accept and submit task first
    const deadline = (await time.latest()).add(time.duration.days(7));
    const tx = await taskEscrow.createTask(taskDescription, deadline, {
      from: client,
      value: oneEther,
    });
    taskId = tx.logs[0].args.taskId.toNumber();
    await taskEscrow.acceptTask(taskId, { from: freelancer });
    await taskEscrow.submitTask(
      taskId,
      "https://github.com/myrepo/landing-page",
      { from: freelancer }
    );

    // Get freelancer balance before
    const balanceBefore = new BN(await web3.eth.getBalance(freelancer));

    // Approve work
    await taskEscrow.approveTask(taskId, { from: client });

    // Get freelancer balance after
    const balanceAfter = new BN(await web3.eth.getBalance(freelancer));

    // Check balance increase
    assert(
      balanceAfter
        .sub(balanceBefore)
        .gte(new BN(oneEther).mul(new BN(99)).div(new BN(100))),
      "Freelancer should receive payment"
    );

    const task = await taskEscrow.getTask(taskId);
    assert.equal(task.status, 5, "Task status should be Completed");
  });

  it("should allow client to dispute submitted work", async () => {
    // Create, accept and submit task first
    const deadline = (await time.latest()).add(time.duration.days(7));
    const tx = await taskEscrow.createTask(taskDescription, deadline, {
      from: client,
      value: oneEther,
    });
    taskId = tx.logs[0].args.taskId.toNumber();
    await taskEscrow.acceptTask(taskId, { from: freelancer });
    await taskEscrow.submitTask(
      taskId,
      "https://github.com/myrepo/landing-page",
      { from: freelancer }
    );

    // Dispute work
    await taskEscrow.disputeTask(taskId, { from: client });

    const task = await taskEscrow.getTask(taskId);
    assert.equal(task.status, 4, "Task status should be Disputed");
  });

  it("should allow client to cancel unaccepted task", async () => {
    // Create task
    const deadline = (await time.latest()).add(time.duration.days(7));
    const tx = await taskEscrow.createTask(taskDescription, deadline, {
      from: client,
      value: oneEther,
    });
    taskId = tx.logs[0].args.taskId.toNumber();

    // Get client balance before
    const balanceBefore = new BN(await web3.eth.getBalance(client));

    // Cancel task
    const cancelTx = await taskEscrow.cancelTask(taskId, { from: client });

    // Get gas used
    const gasUsed = new BN(cancelTx.receipt.gasUsed);
    const tx1 = await web3.eth.getTransaction(cancelTx.tx);
    const gasPrice = new BN(tx1.gasPrice);
    const gasCost = gasPrice.mul(gasUsed);

    // Get client balance after
    const balanceAfter = new BN(await web3.eth.getBalance(client));

    // Check balance (accounting for gas costs)
    assert(
      balanceAfter
        .add(gasCost)
        .sub(balanceBefore)
        .gte(new BN(oneEther).mul(new BN(99)).div(new BN(100))),
      "Client should receive refund"
    );

    const task = await taskEscrow.getTask(taskId);
    assert.equal(task.status, 6, "Task status should be Cancelled");
  });
});
