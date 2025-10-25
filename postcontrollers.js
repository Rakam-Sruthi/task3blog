const Post = require('../models/Post');

// list with pagination + search + filters
exports.list = async (req, res) => {
  try {
    const { page=1, limit=10, search='', category, author } = req.query;
    const q = { published: true, approved: true }; // only show approved published posts to guests
    if(search) q.title = { $regex: search, $options: 'i' };
    if(category) q.category = category;
    if(author) q.authorName = author;
    const skip = (page-1)*limit;
    const [items, total] = await Promise.all([
      Post.find(q).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)).populate('author','name'),
      Post.countDocuments(q)
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total/limit) });
  } catch (err) { res.status(500).json({message: err.message}); }
};

exports.getById = async (req,res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author','name');
    if(!post) return res.status(404).json({message:'Not found'});
    // if not published/approved and user not admin/owner => 403
    if((!post.published || !post.approved) && (!req.user || (req.user._id.toString() !== post.author._id.toString() && req.user.role !== 'admin'))) {
      return res.status(403).json({ message:'Not allowed' });
    }
    res.json(post);
  } catch (err) { res.status(500).json({message: err.message}); }
};

exports.create = async (req,res) => {
  try {
    const { title, content, category, imageUrl, published=false } = req.body;
    const post = await Post.create({
      title, content, category, imageUrl,
      author: req.user._id,
      authorName: req.user.name,
      published,
      approved: req.user.role==='admin' ? true : false // if admin, auto-approve
    });
    res.json(post);
  } catch(err){ res.status(500).json({message: err.message}); }
};

exports.update = async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({message:'Not found'});
    if(post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({message:'Forbidden'});
    const up = ['title','content','category','imageUrl','published'];
    up.forEach(k => { if(req.body[k]!==undefined) post[k] = req.body[k]; });
    // if edited by non-admin, mark as unapproved again
    if(req.user.role !== 'admin') post.approved = false;
    await post.save();
    res.json(post);
  } catch(err){ res.status(500).json({message: err.message}); }
};

exports.remove = async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({message:'Not found'});
    if(post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({message:'Forbidden'});
    await post.remove();
    res.json({ message:'Deleted' });
  } catch(err){ res.status(500).json({message: err.message}); }
};

exports.approve = async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post) return res.status(404).json({message:'Not found'});
    post.approved = true;
    await post.save();
    res.json(post);
  } catch(err){ res.status(500).json({message: err.message}); }
};

exports.pending = async (req,res) => {
  try {
    const posts = await Post.find({ approved: false }).sort({ createdAt: -1 }).populate('author','name');
    res.json(posts);
  } catch(err){ res.status(500).json({message: err.message}); }
};