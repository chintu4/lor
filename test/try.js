const { expect } = require("chai");

describe("LOR Contract", function () {
  let LOR, lor, owner;

  beforeEach(async function () {
    LOR = await ethers.getContractFactory("LOR");
    lor = await LOR.deploy();
    await lor.waitForDeployment();
    [owner] = await ethers.getSigners();
  });

  it("should add and get a student", async function () {
    await lor.addStudent("Alice", "Math", "alice@email.com");
    const student = await lor.getStudent(0);
    expect(student.name).to.equal("Alice");
    expect(student.course).to.equal("Math");
    expect(student.email).to.equal("alice@email.com");
    expect(student.requested).to.equal(false);
  });

  it("should request and approve recommendation", async function () {
    await lor.addStudent("Bob", "Physics", "bob@email.com");
    await lor.requestRecommendation(0);
    let student = await lor.getStudent(0);
    expect(student.requested).to.equal(true);

    await lor.approveRecommendation(0);
    student = await lor.getStudent(0);
    expect(student.approved).to.equal(true);
  });
});