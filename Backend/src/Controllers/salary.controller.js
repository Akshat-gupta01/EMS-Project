const { Salary, User } = require('../models');

async function addSalary(req,res) {
    try {
        const {userId,basicSalary,bonus,deduction,netsalary,month,year} = req.body;

        const salary = await Salary.create({userId,basicSalary,bonus,deduction,netsalary,month,year});

        return res.status(200).json({message:"Salary added successfully",salary});

    } catch (error) {
        return res.status(500).json({message:"Error adding salary",error});
    }
}

async function updateSalary(req,res) {
    try {
        const id= req.params.id;
        const checksalary=await Salary.findByPk(id);
        if(!checksalary){
            return res.status(404).json({message:"Salary not found"});
        }
        const salary = await Salary.update({
            basicSalary: req.body.basicSalary,
            bonus: req.body.bonus,
            deduction: req.body.deduction,
            netsalary: req.body.netsalary,
            month: req.body.month,
            year: req.body.year,
        },{where:{id}});

        return res.status(200).json({message:"Salary updated successfully",salary});

    } catch (error) {
        return res.status(500).json({message:"Error updating salary",error});
    }
}

async function getAllSalary(req,res) {
    try {
        const salary=await Salary.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
        });
        return res.status(200).json({message:"Salary fetched successfully",salary});
    } catch (error) {
        console.error("Error in getAllSalary:", error);
        return res.status(500).json({message:"Error fetching salary",error: error.message || error});
    }
}

async function getmySalary(req,res) {
    try {
        const salary=await Salary.findAll({
            where:{userId:req.user.id},
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
        });
        return res.status(200).json({message:"Salary fetched successfully",salary});
    } catch (error) {
        console.error("Error in getmySalary:", error);
        return res.status(500).json({message:"Error fetching salary",error: error.message || error});
    }
}


module.exports={addSalary,updateSalary,getAllSalary,getmySalary};