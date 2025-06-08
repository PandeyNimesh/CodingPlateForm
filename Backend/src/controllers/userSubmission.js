const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById,submitBatch, submitToken} = require("../utils/problemUtility");

const submitCode = async (req,res)=>{

    try{
         const userId = req.result._id;
         const problemId = req.params.id;
       
         const {code , language} = req.body;

         if(!userId||!problemId ||!language){
           return res.status(404).send("Some field missing");
         }

         const problem = await Problem.findById(problemId);
          
         const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "pending",
            testCaseTotal:problem.hiddenTestCases.length
         })

        //  console.log(code);


         const languageId  = await getLanguageById(language);
          const submissions = problem.hiddenTestCases.map((testcase)=>({
            source_code:code,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output
        }));

         const submitResult = await submitBatch(submissions);

         const resultToken = submitResult.map((value)=>value.token);

         const testResult = await submitToken(resultToken);

         // now we update the submissionCode

         let testCasesPassed = 0;
         let runtime = 0;
         let memory = 0;
         let status = 'accepted';
         let errorMessage = "" ;

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
        status = 'wrong'
    }

    // now we store the test result in database

        submittedResult.status = status;;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;

        await submittedResult.save();
        res.status(201).send(submittedResult);

    }

    catch(error){
        res.status(500).send("Internal server error "+ error);

    }

}
module.exports=submitCode;