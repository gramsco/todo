const {exec} = require('child_process')

exec('git pull origin master && git add . && git commit -m "test" && git push origin master',(err,stdout,stderr) => {

    if (err){
        return
    }

    console.log(stdout)

})