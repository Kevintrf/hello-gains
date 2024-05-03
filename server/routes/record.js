const express = require("express");

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

// Get 20 latest exercises
router.route("/exercises").get(async function (req, res) {
  let db_connect = dbo.getDb();

  try {
    var exercises = await db_connect
      .collection("exercises")
      .find({}).limit(20)
      .toArray();
    res.json(exercises);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }

});

// Get amount of exercise entries
router.route("/exercises/getExercisesAmount").get(async function (req, res) {
  let db_connect = dbo.getDb();

  try {
    var exercises = await db_connect.collection("exercises").count()
    res.json(exercises);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Get paginated exercise entries
router.route("/exercises/getPaginatedExercises/:start/:end").get(async function (req, res) {
  let db_connect = dbo.getDb();

  var skipAmount = parseInt(req.params.start);
  var limitAmount = parseInt(req.params.end) - parseInt(req.params.start) + 1;

  try {
    var exercises = await db_connect.collection("exercises").find({}).skip(skipAmount).limit(limitAmount).toArray();
    res.json(exercises);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }

});

//Get all custom exercises by userAuthId
router.route("/exercises/getCustomExercises/:userAuthId").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = { userAuthId: req.params.userAuthId }
    var customExercises = await db_connect.collection("userCustomExercises").find(query1).toArray();

    res.json(customExercises);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Get single exercise by id
router.route("/exercises/:id").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query = { _id: new ObjectId(req.params.id) };
    var exercise = await db_connect.collection("exercises").findOne(query);
    res.json(exercise);
  } catch (e) {
    try {
      let query = { _id: new ObjectId(req.params.id) };
      var exercise = await db_connect.collection("userCustomExercises").findOne(query);
      res.json(exercise);
    } catch (e) {
      console.log("An error occurred accessing the database " + e);
    }
  }
});

// Get exercise name by ID
router.route("/exercises/getNameById/:id").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query = { _id: new ObjectId(req.params.id) };
    var exercise = await db_connect.collection("exercises").findOne(query);
    if (exercise === null) {
      res.json("Deleted exercise");
    }
    else {
      res.json(exercise.name);
    }
  } catch (e) {
    try {
      let query = { _id: new ObjectId(req.params.id) };
      var exercise = await db_connect.collection("userCustomExercises").findOne(query);
      if (exercise === null) {
        res.json("Deleted exercise");
      }
      else {
        res.json(exercise.name);
      }
    } catch (e) {
      console.log("An error occurred accessing the database " + e);
    }
  }
});

// Get exercise ID by name
router.route("/exercises/getIdByName/:name(*)").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query = { name: req.params.name.toString() };
    var exercise = await db_connect.collection("exercises").findOne(query);
    res.json(exercise._id);
  } catch (e) {
    try {
      let query = { name: req.params.name.toString() };
      var exercise = await db_connect.collection("userCustomExercises").findOne(query);
      res.json(exercise._id);
    } catch (e) {
      console.log("An error occurred accessing the database " + e);
    }
  }
});

// Delete custom exercise by id anser userAuthId
router.route("/exercises/deleteCustomExercise/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = {
      "_id": new ObjectId(req.body._id),
      "userAuthId": req.params.userAuthId,
    };
    var deleteCustomExercise = await db_connect.collection("userCustomExercises").deleteOne(query1);

    res.json(deleteCustomExercise);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Get currently active workout plan from userAuthId
router.route("/workout/getMyCurrentPlan/:userAuthId").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = { userAuthId: req.params.userAuthId }
    var userWorkoutPlan = await db_connect.collection("userWorkoutPlans").findOne(query1);

    //If the user has no workout plan, return an empty plan
    if (userWorkoutPlan === null) {
      let results = JSON.stringify({ "days": [{ "day": 1, "exercises": [{"exerciseId": "66017c72aaf961fb3569908b","sets":[{"reps": "5","weight": 25}]}] }], "name": "My workout" });
      res.json(results);
    }
    else {
      let results = JSON.parse(userWorkoutPlan.plan)
      results.name = userWorkoutPlan.name;
      results = JSON.stringify(results);
      res.json(results);
    }
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Get all workout templates available to current userID
router.route("/workout/getAvailableWorkouts/:id").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    //Get all workout templates with publicTrue
    let query = { public: true };
    var publicWorkoutTemplates = await db_connect.collection("workoutTemplates").find(query).toArray();
    //Get all workout templates with current userId && publicFalse
    let query2 = { public: false, creatorUid: req.params.id };
    var myPrivateWorkoutTemplates = await db_connect.collection("workoutTemplates").find(query2).toArray();
    //Combine arrays and return to client
    var result = [].concat(publicWorkoutTemplates, myPrivateWorkoutTemplates);
    res.json(result);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Update current userWorkoutPlans by userid
router.route("/workout/updateUserWorkoutPlans/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = { userAuthId: req.params.userAuthId };
    let query2 = { $set: { plan: JSON.stringify({ "days": req.body.days }), name: req.body.name } };
    let query3 = {
      upsert: true
    };

    var updatePlan = await db_connect.collection("userWorkoutPlans").updateOne(query1, query2, query3);

    res.json(updatePlan);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Finish week by userid
router.route("/workout/finishWeek/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    //Get currentWorkoutIteration from users
    let query1 = { userAuthId: req.params.userAuthId };
    var currentUser = await db_connect.collection("users").findOne(query1);

    //Receive current workout in req.body
    //Create new workout entry with finished: true and timestamp: currentTime and userId: currentuser
    let query2 = {
      "userAuthId": req.params.userAuthId,
      "plan": JSON.stringify(req.body),
      "timeFinished": Date.now(),
      "iteration": currentUser.currentWorkoutIteration
    };
    var postFinishedWeek = await db_connect.collection("userFinishedWorkouts").insertOne(query2);

    res.json(postFinishedWeek);

    //Increment currentWorkoutIteration in users
    let query3 = { $inc: { currentWorkoutIteration: 1 } };
    var incrementIteration = await db_connect.collection("users").updateOne(query1, query3);

  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Create new template userid
router.route("/workout/createNewTemplate/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = {
      "name": req.body.name,
      "creatorUid": req.params.userAuthId,
      "plan": JSON.stringify(req.body.plan),
      "public": req.body.public
    };
    var postCreateNewTemplate = await db_connect.collection("workoutTemplates").insertOne(query1);

    res.json(postCreateNewTemplate);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Delete workoutTemplate by _id and userAuthId
router.route("/workout/deleteTemplate/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = {
      "_id": new ObjectId(req.body._id),
      "creatorUid": req.params.userAuthId,
    };
    var deleteTemplate = await db_connect.collection("workoutTemplates").deleteOne(query1);

    res.json(deleteTemplate);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Add custom exercise based on userAuthId
router.route("/exercise/addCustomExercise/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = {
      "name": req.body.name,
      "description": req.body.description,
      "userAuthId": req.params.userAuthId
    };
    var postCreateNewCustomExercise = await db_connect.collection("userCustomExercises").insertOne(query1);

    res.json(postCreateNewCustomExercise);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Returns all previously finished workouts containing given userAuthId
router.route("/workout/getExerciseHistory/:userAuthId").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = {
      userAuthId: req.params.userAuthId
    };

    var results = await db_connect.collection("userFinishedWorkouts").find(query1).toArray();

    res.json(results);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Returns all previously finished workouts containing the given exerciseId and userId
router.route("/workout/getExerciseHistory/:userAuthId/:exerciseId").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    //Get userId and exerciseId frpm req.params/body

    //Find all where userId and ExerciseID match in previousworkoutwhatever

    let query1 = {
      userAuthId: req.params.userAuthId,
      plan: { $regex: req.params.exerciseId } //This regex will not scale well, although it will (hopefully?) only search documents with the correct userAuthId so maybe its not that bad?
    };

    var results = await db_connect.collection("userFinishedWorkouts").find(query1).toArray();

    res.json(results);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Checks if user has an entry in users and creates one if not
router.route("/profile/setup/:userAuthId").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = {
      userAuthId: req.params.userAuthId
    };

    var results = await db_connect.collection("users").findOne(query1);

    if (results === null) {
      let query2 = {
        "userAuthId": req.params.userAuthId
      };
      results = await db_connect.collection("users").insertOne(query2);
    }

    res.json(results);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//Currently not in use as it is now automatically created when updating non existent userWorkoutPlans
//Checks if user has a userWorkoutPlans and creates one if not
router.route("/workout/setup/:userAuthId").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = {
      userAuthId: req.params.userAuthId
    };

    var results = await db_connect.collection("userWorkoutPlans").findOne(query1);

    if (results === null) {
      let query2 = {
        "userAuthId": req.params.userAuthId
      };
      results = await db_connect.collection("userWorkoutPlans").insertOne(query2);
    }

    res.json(results);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

//This is called whenever a user logs in and checks if the user is properly configured in the database
router.route("/loginSuccess/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = {
      userAuthId: req.params.userAuthId
    };

    var results = await db_connect.collection("users").findOne(query1);

    if (results === null) {
      //Create user
      let query2 = {
        "userAuthId": req.params.userAuthId,
        "currentWorkoutIteration": 1,
        "username": req.body.name
      };
      results = await db_connect.collection("users").insertOne(query2);
    }

    res.json(results);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Get username from userAuthId
router.route("/users/getNameById/:userAuthId").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query = { userAuthId: req.params.userAuthId };
    var user = await db_connect.collection("users").findOne(query);

    if (user === null || user.username === undefined || user.username === null) {
      res.json("Unknown");
    }
    else {
      res.json(user.username);
    }
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Change username
router.route("/users/changeUsername/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query1 = { userAuthId: req.params.userAuthId };
    let query2 = { $set: { username: req.body.username } };
    var changeUsername = await db_connect.collection("users").updateOne(query1, query2);

    res.json(changeUsername);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Post historical data 
router.route("/workout/postHistoricalData/:userAuthId").post(async function (req, res) {
  let db_connect = await dbo.getDb();

  for (let i = 0; i < req.body.length; i++) {
    try {
      let query1 = { userAuthId: req.params.userAuthId, exerciseId: req.body[i].exerciseId };
      var historicalData = await db_connect.collection("userHistoricalData").findOne(query1);

      if (historicalData === null) {
        let query2 = {
          "userAuthId": req.params.userAuthId,
          "exerciseId": req.body[i].exerciseId,
          "sets": req.body[i].sets,
          "highestWeight": req.body[i].highestWeight,
        };
        historicalData = await db_connect.collection("userHistoricalData").insertOne(query2);
      }

      else {
        let query2 = {
          $push: {
            "sets": {
              $each: req.body[i].sets
            }
          },
          $max: {
            "highestWeight": req.body[i].highestWeight
          }
        };
        historicalData = await db_connect.collection("userHistoricalData").updateOne(query1, query2);
      }

    } catch (e) {
      console.log("An error occurred accessing the database " + e);
    }
  }

});

// Get all historical data by userAuthId
router.route("/profile/getAllHistoricalData/:userAuthId").get(async function (req, res) {
  let db_connect = await dbo.getDb();
  try {
    let query = { userAuthId: req.params.userAuthId };
    var historicalData = await db_connect.collection("userHistoricalData").find(query).toArray();
    res.json(historicalData);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Get community post by ID
router.route("/community/getPost/:_id").get(async function (req, res) {
  let db_connect = dbo.getDb();

  try {
    var communityPosts = await db_connect
      .collection("communityPosts")
      .find({ _id: new ObjectId(req.params._id) }).toArray();
    res.json(communityPosts);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }

});

// Get 20 latest community posts
router.route("/community/getLatestPosts").get(async function (req, res) {
  let db_connect = dbo.getDb();

  try {
    var communityPosts = await db_connect
      .collection("communityPosts")
      .find({}).limit(10)
      .toArray();
    res.json(communityPosts);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }

});

// Get amount of community posts
router.route("/community/getPostsAmount").get(async function (req, res) {
  let db_connect = dbo.getDb();

  try {
    var communityPosts = await db_connect.collection("communityPosts").count()
    res.json(communityPosts);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Get paginated community posts
router.route("/community/getPaginatedPosts/:start/:end").get(async function (req, res) {
  let db_connect = dbo.getDb();

  var skipAmount = parseInt(req.params.start);
  var limitAmount = parseInt(req.params.end) - parseInt(req.params.start) + 1;

  try {
    var communityPosts = await db_connect.collection("communityPosts").find({}).skip(skipAmount).limit(limitAmount).toArray();
    res.json(communityPosts);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Like community post
router.route("/community/likePost/:communityPost/:userAuthId").post(async function (req, res) {
  let db_connect = dbo.getDb();

  var communityPostId = req.params.communityPost;
  var userAuthId = req.params.userAuthId;

  try {
    var likePost = await db_connect.collection("communityPosts").updateOne(
      { _id: new ObjectId(communityPostId) },
      { $addToSet: { likedBy: userAuthId } }
    );
    res.json(likePost);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Unlike community post
router.route("/community/unlikePost/:communityPost/:userAuthId").post(async function (req, res) {
  let db_connect = dbo.getDb();

  var communityPostId = req.params.communityPost;
  var userAuthId = req.params.userAuthId;

  try {
    var unlikePost = await db_connect.collection("communityPosts").updateOne(
      { _id: new ObjectId(communityPostId) },
      { $pull: { likedBy: userAuthId } }
    );
    res.json(unlikePost);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);
  }
});

// Create new community post
router.route("/community/newPost/:userAuthId").post(async function (req, res) {
  let db_connect = dbo.getDb();

  let query = {
    "userAuthId": req.params.userAuthId,
    "title": req.body.title,
    "subtitle": req.body.subtitle,
    "timestamp": req.body.timestamp,
    "likedBy": [],
  };

  try {
    var newPost = await db_connect.collection("communityPosts").insertOne(query);
    res.json(newPost);
  } catch (e) {
    console.log("An error occurred accessing the database " + e);

  }
});

module.exports = router;