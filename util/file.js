const fs = require('fs');
const path = require('path');

const deleteFile = (fileUrl) => {

    const filePath = path.join(__dirname,'..',fileUrl);

    fs.unlink(filePath, (err) => {
        if(err){
            throw (err);
        }
    });
}

exports.deleteFile = deleteFile;