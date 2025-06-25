const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById,submitBatch, submitToken} = require("../utils/problemUtility");

const submitCode = async (req,res)=>{

    try{
         const userId = req.result._id;
         const problemId = req.params.id;
       
         let {code , language} = req.body;

         if(!userId||!problemId ||!language){
           return res.status(404).send("Some field missing");
         }
         if(language=="cpp"){
          language="c++"
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

        //insert problem id into schema if it is not present there

      if(!req.result.problemSolved.includes(problemId)){
        req.result.problemSolved.push(problemId);
        await req.result.save();
      }
        // res.status(201).send(submittedResult);
        const accepted=(status == 'accepted')
         res.status(201).json({
          accepted,
          totalTestCases:submittedResult.testCaseTotal,
          passedTestCases:testCasesPassed,
          runtime,
          memory
         });

    }


    catch(error){
        res.status(500).send("Internal server error "+ error);

    }

}

const runCode = async(req,res)=>{
    
     // 
     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      let {code,language} = req.body;

     if(!userId||!code||!problemId||!language)
       return res.status(400).send("Some field missing");

   //    Fetch the problem from database
      const problem =  await Problem.findById(problemId);
   //    testcases(Hidden)
      if(language==='cpp')
        language='c++'

   //    Judge0 code ko submit karna hai

   const languageId = getLanguageById(language);

   const submissions = problem.visibleTestCases.map((testcase)=>({
       source_code:code,
       language_id: languageId,
       stdin: testcase.input,
       expected_output: testcase.output
   }));


   const submitResult = await submitBatch(submissions);
   
   const resultToken = submitResult.map((value)=> value.token);

   const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = false
            errorMessage = test.stderr
          }
          else{
            status = false
            errorMessage = test.stderr
          }
        }
    }

   
  
   res.status(201).json({
    success:status,
    testCases: testResult,
    runtime,
    memory
   });
      
   }
   catch(err){
     res.status(500).send("Internal Server Error "+ err);
   }
}
module.exports={submitCode,runCode};