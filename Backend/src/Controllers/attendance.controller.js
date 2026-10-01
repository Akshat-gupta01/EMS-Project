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




module.exports={markAttendance,getallAttendance,updateAttendance}
