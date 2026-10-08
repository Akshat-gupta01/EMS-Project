const { Op } = require('sequelize');
const { Attendance, User, Department } = require('../models');

async function markAttendance(req,res){
    try {
        const {userId,attendance_status,date}=req.body;
         const existingRecord = await Attendance.findOne({
            where: { userId, date }
        });

        if(existingRecord){
            return res.status(400).json({
                message:"Attendance already marked"
            })
        }
        const newAttendance = await Attendance.create({
            userId,
            attendance_status,
            date
        });
        res.status(201).json(
            {message:'Attendance marked successfully',
            attendance: newAttendance
        });
    } catch (error) {
        res.status(500).json(
            {message:'Error marking attendance'});
    } 
}


async function getallAttendance(req,res) {
   try{
    const date = req.query.date || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const attendance=await Attendance.findAll({
     where:{date:date},
     include: [
    {
      model: User,
      as: 'user',
      attributes: ["id", "username"],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ["id", "departmentName"]
        }
      ]
    }
  ]
   });
   console.log(attendance);
   res.status(200).json({
    message:'Attendance fetched successfully',
    attendance
   })
   } catch(err){
    console.log(err);
    res.status(500).json({
        message:'Error fetching attendance'
    })
   }
}


async function updateAttendance(req,res) {
    const id=req.params.id;
    const attendance=await Attendance.findByPk(id);
    if(!attendance){
        return res.status(400).json({
            message:"no found attendance"
        })
    }

    await attendance.update({
        attendance_status: req.body.attendance_status
    })
    res.status(200).json({
        message:'Attendance updated successfully',
        attendance
    })
}


async function getallAttendancereport(req, res) {
  try {
    const { startDate, endDate, userId, departmentId } = req.query;

    // 1. Pagination Parameters (Default: Page 1, Limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 2. Filter Condition
    let whereCondition = {};
    if (startDate && endDate) {
      whereCondition.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (userId) {
      whereCondition.userId = userId;
    }

    // 3. findAndCountAll with Limit & Offset
    const { count, rows } = await Attendance.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [['date', 'DESC'], ['id', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'departmentName']
            }
          ]
        }
      ]
    });

    // 4. Send Response with Pagination Info
    return res.status(200).json({
      message: 'Attendance report fetched successfully',
      data: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      itemsPerPage: limit
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return res.status(500).json({ message: "Failed to fetch attendance report" });
  }
}


module.exports={markAttendance,getallAttendance,updateAttendance,getallAttendancereport}
