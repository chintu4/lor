// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract LOR{
struct Student{
	string name;
	string university;
	string program;
	bool approved;
	string course;
	string email;
	bool requested;
}
mapping(uint256 =>Student) public students;
uint256 public studentCount;

	
	function requestRecommendation(string memory _name, string memory _university, string memory _program) public {
		uint256 id = studentCount++;
		students[id] = Student({
			name: _name,
			university: _university,
			program: _program,
			approved: false,
			course: "",
			email: "",
			requested: true
		});
	}

	function requestRecommendation(uint256 studentId) public {
		require(bytes(students[studentId].name).length != 0, "Student does not exist");
		students[studentId].requested = true;
	}

	function addStudent(string memory _name, string memory _course, string memory _email) public {
		uint256 id = studentCount++;
		students[id] = Student({
			name: _name,
			university: "",
			program: "",
			approved: false,
			course: _course,
			email: _email,
			requested: false
		});
	}
	
	function approveRecommendation(uint256 studentId) public {
		require(!students[studentId].approved, "Recommendation already approved");
		students[studentId].approved = true;
	}

	function getStudent(uint256 studentId) public view returns (
		string memory name,
		string memory university,
		string memory program,
		bool approved,
		string memory course,
		string memory email,
		bool requested
	) {
		Student memory s = students[studentId];
		return (
			s.name,
			s.university,
			s.program,
			s.approved,
			s.course,
			s.email,
			s.requested
		);
	}
	
	function getStudentDetails(uint256 _id) public view returns(string memory, string memory, string memory, bool, string memory, string memory, bool){
		return (
			students[_id].name,
			students[_id].university,
			students[_id].program,
			students[_id].approved,
			students[_id].course,
			students[_id].email,
			students[_id].requested
		);
	}
}