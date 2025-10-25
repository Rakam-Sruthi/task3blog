
module.exports = function(allowedRoles = []) {
  return (req,res,next) => {
    if(!req.user) return res.status(401).send({message:'Not authenticated'});
    if(!allowedRoles.includes(req.user.role)) return res.status(403).send({message:'Forbidden'});
    next();
  };
};