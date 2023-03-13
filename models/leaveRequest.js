module.exports = (sequelize,DataTypes) =>{
  const leaveRequest = sequelize.define('leaveRequests', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    requestToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leaveType: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['full day', 'first half', 'second half']
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['pending', 'approved', 'rejected'],
        defaultValue: 'pending'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    }
    }, {
      timestamps: false,
    });
  
  return leaveRequest;
}