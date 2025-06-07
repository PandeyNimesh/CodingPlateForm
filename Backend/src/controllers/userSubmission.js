const Problem = require("../models/problem");
const { getLanguageById, submitToken } = require("../utils/problemUtility");

const submitCode = async (req,res)=>{

    try{
         const userId = req.result._id;
         const problemId = req.params.id;

         const {code , language} = req.body;

         if(!userId || !problemId || !language){
           return res.status(404).send("Some field missing");
         }

         const problem = await Problem.findById(problemId);
         const submitResult = await Submission.create({
            userId,
            problem,
            code,
            language,
            status: "pending",
            testCaseTotal:problem.hiddenTestCases.length
         })


         const languageId  = await getLanguageById();
          const submissions = problem.hiddenTestCasesTestCases.map((testcase)=>({
            source_code:code,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output
        }));

         const submitBatch = await submitBatch(submissions);

         const resultToken = submitResult.map((value)=>value.token);

         const testResult = await submitToken(resultToken);

         // now we update the submissionCode

         let testCasesPassed = 0;
         let runtime = 0;
         let memory = 0;
         let status = 'accepted';
         let errorMessage = null ;

    for(const test of testResult){

        if(test.status_id == 3) {
            testCasesPassed++;
            runtime = runtime + parseFloat(test.time);
             memory = Math.max(memory, test.memory);
        }   
        else
        if(test.status_id == 4){
            status = 'error'
            errorMessage = test.stderr;
        }
        status = 'wrong result'
    }

    // now we store the test result in database

        submitResult.status = status;
        submitResult.testCasesPassed = testCasesPassed;
        submitResult.errorMessage = errorMessage;
        submitResult.runtime = runtime;
        submitResult.memory = memory;

        await submitResult.save();
        res.status(201).send("submitted");

    }

    catch(error){
        res.status(500).send("Internal server error");

    }

}
module.exports=submitCode;