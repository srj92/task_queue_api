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
        // Prepare response
        var responseArray = getResponseArray(currentRequestTimeMillis); 
        res.json(responseArray);
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


    app.delete('/remove/:task', (req, res) => {
        // Get current timestamp to calculate the remaing time in each left task
        const currentRequestTimeMillis = getCurrentTimeMillis();

        // Delete the task object from queue object
        var taskName = req.params.task;
        delete queue[taskName]; 
        
        // Prepare response
        var responseArray = getResponseArray(currentRequestTimeMillis);
       
        // Return response
        res.json(responseArray);
    });


    /**
     * Helper functions
     */

    //Returns current timestamp in milli seconds
    function getCurrentTimeMillis() {
        const currentRequestTime = new Date(); 
        const currentRequestTimeMillis = Math.round(currentRequestTime.getTime()); 
        return currentRequestTimeMillis;
    }

    /**
    * Iterate the queue containg all current polling tasks, 
    * calculate remaining time and return response array.
    */
    function getResponseArray(currentRequestTimeMillis) {
        var responseArray = [];
        for (var task in queue) {
            if(queue.hasOwnProperty(task) ) {
                const inputTimeMillis = queue[task].inputTimeMillis;
                const difference = currentRequestTimeMillis - inputTimeMillis;
                const remainingTimeMillis = queue[task].timeOffset*1000 - difference;

                // Remaining time will be >= 0 only for running tasks. Finished tasks will be in negative
                if (remainingTimeMillis>=0) {
                    const response = {
                        name: queue[task].taskName,
                        remaining: remainingTimeMillis
                    }
                    responseArray.push(response);    
                }
            }
        }
        return responseArray;
    }

};