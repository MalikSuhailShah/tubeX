/* We use middleware in file uploads because the uploaded file needs to be processed before the request reaches the controller.
  Middleware prepares/checks the request; the controller performs the actual business operation
  Multer middleware prepares the uploaded file so your controller can process it.*/


  import multer from "multer";
 

  const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, "./public/temp")// basically it gives destination at which file is saved  , synatax ;- cb(error, destination folder)
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)// name of file save to the local server
    }
  })



  export const upload = multer({
    storage,
  })