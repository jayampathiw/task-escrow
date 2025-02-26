const TaskEscrow = artifacts.require("TaskEscrow");

module.exports = function (deployer) {
  deployer.deploy(TaskEscrow);
};
