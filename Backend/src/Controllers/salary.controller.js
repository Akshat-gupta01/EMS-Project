const { Salary, User } = require('../models');
const { Op } = require('sequelize');

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

async function getAllSalary(req, res) {
    try {
        const { search } = req.query;

        // 1. Pagination Parameters (Default: Page 1, Limit 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 2. Search Condition on User (Employee Name)
        const userWhere = {};
        if (search && search.trim()) {
            userWhere.username = { [Op.like]: `%${search.trim()}%` };
        }

        // 3. findAndCountAll with Limit & Offset
        const { count, rows } = await Salary.findAndCountAll({
            limit: limit,
            offset: offset,
            distinct: true,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email'],
                where: search && search.trim() ? userWhere : undefined,
                required: search && search.trim() ? true : false
            }],
            order: [['id', 'DESC']]
        });

        // 3. Send Response with Pagination Info
        return res.status(200).json({
            message: "Salary fetched successfully",
            salary: rows,
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            itemsPerPage: limit
        });
    } catch (error) {
        console.error("Error in getAllSalary:", error);
        return res.status(500).json({ message: "Error fetching salary", error: error.message || error });
    }
}

async function getmySalary(req, res) {
    try {
        // 1. Pagination Parameters (Default: Page 1, Limit 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 2. findAndCountAll with Limit & Offset
        const { count, rows } = await Salary.findAndCountAll({
            where: { userId: req.user.id },
            limit: limit,
            offset: offset,
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
            order: [['id', 'DESC']]
        });

        // 3. Send Response with Pagination Info
        return res.status(200).json({
            message: "Salary fetched successfully",
            salary: rows,
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            itemsPerPage: limit
        });
    } catch (error) {
        console.error("Error in getmySalary:", error);
        return res.status(500).json({ message: "Error fetching salary", error: error.message || error });
    }
}


module.exports={addSalary,updateSalary,getAllSalary,getmySalary};