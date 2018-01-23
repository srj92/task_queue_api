module.exports = function(app) {

    // Our in memory queue object holding all polling tasks
    var queue = {};

    // Task template to store task data
    function Task(inputTimeMillis, taskName, timeOffset) {
        this.inputTimeMillis = inputTimeMillis;
        this.taskName = taskName;
        this.timeOffset = timeOffset;
    }


    /**
     * Routes for queue api below
     */

    app.get('/all', (req, res) => {

        // Get current timestamp to calculate the remaing time in each task
        const currentRequestTimeMillis = getCurrentTimeMillis();
        var reponseArray = [];

        /**
         * Iterate the task queue containg all current running tasks, 
         * calculate remaining time and form response array.
         */
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


    
    app.post('/queue/:task/:timeOffset', (req, res) => {
        const currentRequestTimeMillis = getCurrentTimeMillis();
        var taskName = req.params.task;
        var timeOffset = req.params.timeOffset;

        // Create current task object and store in queue object
        var task = new Task(currentRequestTimeMillis, taskName, timeOffset);
        queue[taskName] = task;
        
        var response = {name: taskName, done: true}; // Create response object
       
        // Return response after timeOffset seconds
        setTimeout( function() {  
            res.json(response);
        }, timeOffset*1000);
    });


    // Helper function. Returns current timestamp in milli seconds
    function getCurrentTimeMillis() {
        const currentRequestTime = new Date(); 
        const currentRequestTimeMillis = Math.round(currentRequestTime.getTime()); 
        return currentRequestTimeMillis;
    }

};