const {Task,User}=require("../models")
const { Op } = require("sequelize");

const createTask=async(req,res)=>{
    try{
        const {title,description,priority,dueDate}=req.body
        const userId=req.user.id
        const task=await Task.create({
            title,
            description,
            assignedTo:userId,
            priority:priority||'medium',
            dueDate,
            assignedBy:userId,
            status:'pending'
        })
        return res.status(201).json({message:"Task added successfully",task})

    }catch(error){
        console.error("Error adding task:", error);
        return res.status(500).json({ error: error.message || "Failed to add task" });
    }
}

const assignTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, dueDate } = req.body;
        const assignedBy = req.user.id;

        if (!assignedTo) {
            return res.status(400).json({ message: "assignedTo is required" });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo,
            priority: priority || 'medium',
            dueDate,
            assignedBy,
            status: 'pending'
        });

        return res.status(201).json({ message: "Task assigned successfully", task });
    } catch (error) {
        console.error("Error assigning task:", error);
        return res.status(500).json({ error: error.message || "Failed to assign task" });
    }
};

const updateTask=async(req,res)=>{
    try{
        const id=req.params.id;
        const userId=req.user.id;
        const roleName=req.user.Role?.name?.toLowerCase();

        const task=await Task.findByPk(id);
        if(!task){
            return res.status(404).json({message:"Task not found"});
        }

        const canUpdateAnyTask = [
            "admin",
            "hr",
            "manager"
        ].includes(roleName);

        const isCreator = Number(task.assignedBy) === Number(userId);

        if (!canUpdateAnyTask && !isCreator) {
            return res.status(403).json({
                message: "You can update only tasks created by you"
            });
        }

        await task.update({
            title: req.body.title !== undefined ? req.body.title : task.title,
            description: req.body.description !== undefined ? req.body.description : task.description,
            assignedTo: req.body.assignedTo !== undefined ? req.body.assignedTo : task.assignedTo,
            priority: req.body.priority !== undefined ? req.body.priority : task.priority,
            dueDate: req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate,
            status: req.body.status !== undefined ? req.body.status : task.status
        });

        return res.status(200).json({
            message: "Task updated successfully",
            task
        });
    }catch(error){
        console.error("Error updating task:", error);
        return res.status(500).json({ error: error.message || "Failed to update task" });
    }
}

const deleteTask=async(req,res)=>{
    try{
        const id=req.params.id;

        const task=await Task.findByPk(id);
        if(!task){
            return res.status(404).json({message:"Task not found"})
        }

        await task.destroy();
        return res.status(200).json({message:"Task deleted successfully"})
    }catch(error){
        return res.status(500).json({error:error.message})
    }
}

const getTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const roleName = req.user.Role?.name?.toLowerCase();

        const where = {};

        // Employee + Accountant: Sirf jo unko assign hue hain YA jo unhone khud create kiye hain
        if (roleName === "employee" || roleName === "accountant") {
            where[Op.or] = [
                { assignedTo: userId },
                { assignedBy: userId }
            ];
        }

        // Admin, HR, Manager ke liye 'where' khali rahega (yani unhe saare tasks dikhenge)

        const tasks = await Task.findAll({
            where,
            include: [
                {
                    model: User,
                    as: "assignee",
                    attributes: ["id", "username", "email"]
                },
                {
                    model: User,
                    as: "assigner",
                    attributes: ["id", "username", "email"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            message: "Tasks fetched successfully",
            tasks
        });
    } catch (error) {
        console.error("Get tasks error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};

module.exports = {
    createTask,
    assignTask,
    updateTask,
    deleteTask,
    getTask,
    getAllTasks: getTask
};