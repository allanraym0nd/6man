const validation = {
    validationRegistration: (req, res, next) => {
        const {username,email,password} = req.body
        const errors = []

        if(!username || username.trim().length < 3){
            errors.push('username must be atleast 3 characters long')
        }

        if(!email || !/\S+@\S+\.\S+/.test(email)){ // the \S in regex means a sequence of characters
            errors.push('Valid email required')
        }

        if(!password || password.length < 6){
            errors.push("Password must be at least six characters long")
        }

        if(username || /^[a-zA-Z0-9_]+$/.test(username)){ // dollar sign asserts the end of the string
            errors.push("Username can only contain letters, numbers, and underscores")
        }

        if(errors.length>0){
            return res.status(400).json({error: errors.join(',')}) // json object with the name error
        }
        next();

    },

     validateUserRegistration: (req,res,next) => {
        const {username,email,password} = req.body 
        const errors = []

        if(!email || !email.trim()){
            errors.push("Email is required")
        }

        if(!password || !password.trim()){
            errors.push("Password is required")
        }

        if(errors.length > 0){
            res.status(400).json({error: errors.join(",")})
        }
            
     },

     validatePrediction: (req,res,next) => {
        const {gameId, gameDate, player, predictions} = req.body
        const errors= []

        // required fields

        if(!gameId || typeof gameId !== 'string'){
            errors.push("Valid gameid is required")
        }

        if(!gameDate || isNaN(Date.parse(gameDate))){ //Date.parse() returns Nan(not a number) if a string is not a valid date format
         errors.push('Valid gameDate is required')
        }

        //player validation
        if(!player || typeof player !== "object" ){
            errors.push("player information is required")
        } else {

            if (!player.id || typeof player.id !== 'string') {
            errors.push('Player ID is required');

            if(!player.name || typeof player.name !== 'string'){
                errors.push("Player name is required")
            }

            if (!player.team || typeof player.team !== 'string') {
             errors.push('Player team is required');
            }
         } 
     }
        //predictions validation
        if(!predictions || typeof predictions !== "object"){
            errors.push("Predictions are required")
        } else {
            const requiredStats = ['points', 'rebounds', 'assists']
            requiredStats.forEach(stat => {
                if(predictions[stat] === "undefined" || prediction[stat] === null){
                    errors.push(`${stat} is required`)
                }else if (typeof predictions[stat] !== "number" || predictions[stat] < 0){
                    errors.push(`${stat} must be a non-negative number`)
                } else if(predictions[stat] > 100) {
                    errors.push(`${stat} prediction seems unrealistic (max 100)`)
                }
            })
        }
        if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }
    next()
     },

     validateAIPrediction: (req,res,next) => {
        const {gameId, gameDate, player, predictions, aiModel, confidence} = req.body
        const errors = []

        validate.validatePrediction(req,res,(err) => {
            if(err) return;

            if(!aiModel || typeof aiModel !== "String"){
                errors.push("AI model identifier is required")
            }
            if (confidence === undefined || confidence === null) {
                errors.push('Confidence level is required');
            }

            else if ( typeof confidence !== 'number' || confidence < 0){
                errors.push("Confidence must be a non-negative number")
            }

            if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(', ') });
        }
        next();
        })
     }, 


     validatePredictionResult: (req,res,next) => {
        const {actualStats} = req.body
        const errors = []

         if (!actualStats || typeof actualStats !== 'object') {
         errors.push('Actual stats are required');
         } else {
        const requiredStats = ['points', 'rebounds', 'assists'];
        requiredStats.forEach(stat => {
            if (actualStats[stat] === undefined || actualStats[stat] === null) {
            errors.push(`Actual ${stat} is required`);
            } else if (typeof actualStats[stat] !== 'number' || actualStats[stat] < 0) {
            errors.push(`Actual ${stat} must be a non-negative number`);
            }
        });
        }

        if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
        }
        next();

     }, 

     validateLeagueCreation: (req,res,next) => {
        const {name,description,maxMembers,type,rules} = req.body
        const errors = []

        if(!name || typeof name !== "String" || name.trim().length < 3){
             errors.push('League name must be at least 3 characters long');
        }
        if (description && typeof description !== 'string') {
            errors.push('Description must be a string');
        }
        if(maxMembers !== "undefined" && (typeof maxMembers !== "Numbers") || maxMembers < 2 || maxMembers > 1000 ){
            errors.push('Max members must be between 2 and 1000');
        }
        if(type && !['private','public','invite-only'].includes(privacy)){
            errors.push('Privacy must be public, private, or invite-only');
        }



         if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(', ') });
        }
         next();

     },
     // Validate MongoDB ObjectId
     validateObjectId: (paramName) => {
        return (res,req,next) =>{
            const id =req.params[paramName]
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;

            if(!id || !objectIdRegex.test(id)){
                res.status(400).json({error: `Invalid ${paramName} format`})
            }
            next()
        }     
     },

     validatePagination: (req,res,next) => {
        const {page =1, limit = 20} = req.query

         const pageNum = parseInt(page);
         const limitNum = parseInt(limit);

         if(pageNum < 1|| pageNum > 1000){
             return res.status(400).json({ error: 'Page must be between 1 and 1000' });
         }
         if(limit < 1 || limit > 1000){
            return res.status(400).json({ error: 'Limit must be between 1 and 100' });
         }

         req.pagination = {page: pageNum, limit: limitNum}
         next()
     }
}

export default validation;