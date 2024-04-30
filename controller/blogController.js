import BlogModel from "../models/blogModel.js";
import UserModel from "../models/userModel.js";

//Get all blogs
export async function getAllBlogs(req, res){
    try {
        const blogs = await UserModel.find();
        res.json(users);
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}
//Get blog by ID
export async function getBlogByID(req, res){
    try {
        const blog = await UserModel.findById(req.params.id);
        if(!users){
            res.status(404).json({message: 'Blog not found'})
        }else{
            res.json(blog);
        }
        res.json(blog);
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}
//Create new blog post
export async function createBlogPost(req, res){
    try {
        const {title, content, author} = req.body;
        const newBlog = new BlogModel({
            title,
            content,
            author,
            createdAt: new Date(),
            comments:[],
            likes:0
        })
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    }
    catch (error){
        res.status(400).json({message: error.message})
    }
}

//Like a blog post
export async function likeBlogPost(req, res){
    try {
        const blog = await UserModel.findById(req.params.id);
        if(!blog){
            return res.status(404).json({message: 'Blog not found'})
        }
        blogs.likes++;
        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}

//Create a blog comment

export async function addBlogComment(req, res){
    try {
        const { userId, content} = req.body;
        const blog = await UserModel.findById(req.params.id);
        if(!blog){
            return res.status(404).json({message: 'Blog not found'})
        }
        const newComment = {
            user: userID,
            content,
            likes: 0
        };
        blog.comments.push(newComment);
        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}

//Like blog comment
export async function likeblogComment(req, res){
    try {
        const blog = await UserModel.findById(req.params.id);
        if(!blog){
            return res.status(404).json({message: 'Blog not found'})
        }
        const commentIndex  = parseInt(req.params.commentIndex);
        if (isNaN(commentIndex) || commentIndex < 0 || commentIndex >= blog.comment.length){
            return res.status(404).json({message: 'Invalid comment index'});
        }
        const comment = blog.comments[commentIndex]
        comment.likes++;
        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}

//Delete a blog post

export async function deleteBlogPost(req, res)
{
        try {
            const blog = await UserModel.findByIdandDelete(req.params.id);
            if(!users){
                res.status(404).json({message: 'Blog not found'})
            }else{
                res.json(blog);
            }
            res.json(blog);
        }
        catch (error){
            res.status(500).json({message: error.message})
        }
}