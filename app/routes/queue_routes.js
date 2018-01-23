module.exports = function(app) {

    // Our in memory queue object holding all polling tasks
    var queue = {};

    function Task(inputTimeMillis, taskName, timeOffset) {
        this.inputTimeMillis = inputTimeMillis;
        this.taskName = taskName;
        this.timeOffset = timeOffset;
    }

    /*
    *  Routes for queue api below
    */

    // Get all currently polling tasks route
    app.get('/all', (req, res) => {

        const currentRequestTimeMillis = getCurrentTimeMillis();
        var reponseArray = [];

        for (var task in queue) {
            if(queue.hasOwnProperty(task) ) {
                const inputTimeMillis = queue[task].inputTimeMillis;
                const difference = currentRequestTimeMillis - inputTimeMillis;
                const remainingTimeMillis = queue[task].timeOffset*1000 - difference;

                const response = {
                    name: queue[task].taskName,
                    remaining: remainingTimeMillis
                }
                reponseArray.push(response);    
            }
        } 
        res.json(reponseArray);
    });

    // Add a polling task route
    app.post('/queue/:task/:timeOffset', (req, res) => {
        
        const currentRequestTimeMillis = getCurrentTimeMillis();

        var taskName = req.params.task;
        var timeOffset = req.params.timeOffset;

        var task = new Task(currentRequestTimeMillis, taskName, timeOffset);
        queue[taskName] = task;
        
        var response = {name: taskName, done: true};

        setTimeout( function(){ 
            res.json(response);
        }, timeOffset*1000);
    });

    // Returns current timestamp in milli seconds
    function getCurrentTimeMillis() {
        const currentRequestTime = new Date(); 
        const currentRequestTimeMillis = Math.round(currentRequestTime.getTime()); 
        return currentRequestTimeMillis;
    }

};