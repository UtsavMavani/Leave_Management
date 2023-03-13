const Boom = require('@hapi/boom');
const { message } = require('../utils/message');
const db = require('../database/config');
const LeaveRequest = db.leaveRequests;
const UserLeave = db.userLeaves;

// Apply for leave
const leaveRequest = async (req, res, next) => {
  try {
    const data = req.body;
    data.userId = req.user;

    const leave = await LeaveRequest.create(data);

    res.status(200).json({
      message: 'Leave applied successfully',
      data: leave
    });

  } catch (err) {
    return next(Boom.badImplementation(err));
  }
}

// View leave status
const viewLeaveStatus = async (req, res, next) => {
  try {
    const userId = req.user;

    const leave = await LeaveRequest.findAll({ where: { userId } });

    res.status(200).json({
      data: leave
    });

  } catch (err) {
    return next(Boom.badImplementation(err));
  }
}

// View leave balance
const viewLeaveBalance = async (req, res, next) => {
  try {
    const userId = req.user;

    const leave = await UserLeave.findAll({ where: { userId } });

    res.status(200).json({
      data: leave
    });

  } catch (err) {
    return next(Boom.badImplementation(err));
  }
}

// Update leave status by admin
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await LeaveRequest.findOne({ where: { id } });
    if(!leave){
      return next(Boom.badRequest(message.RECORD_NOT_FOUND));
    }

    if (leave.status === "approved" || leave.status === "rejected") {
      return next(Boom.badRequest("Leave status can't update"));
    }

    leave.status = status;
    const updatedLeave = await leave.save();

    if (updatedLeave.status === "approved"){
      const userId = leave.userId;
      const leaveDays = parseInt((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24) + 1);

      const userLeave = await UserLeave.findOne({ where: { userId } });
      if(!userLeave){
        return next(Boom.badRequest(message.RECORD_NOT_FOUND));
      }

      userLeave.availableLeave -= leaveDays;
      userLeave.usedLeave += leaveDays;
      userLeave.attendancePerc = Math.round((userLeave.totalWorkingDays - userLeave.usedLeave) * 100 / userLeave.totalWorkingDays);

      await userLeave.save();
    }

    res.status(200).json({
      message: 'Leave status updated successfully',
      data: updatedLeave
    });

  } catch (err) {
    console.log(err);
    return next(Boom.badImplementation(err));
  }
}


module.exports = {
  leaveRequest,
  viewLeaveStatus,
  viewLeaveBalance,
  updateLeaveStatus
}