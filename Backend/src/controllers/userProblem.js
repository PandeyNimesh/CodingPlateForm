const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem=require("../models/problem");
const User =require("../models/user")

const createProblem=async (req,res)=>{

    const {
        title,description,difficulty,tags,visibleTestCases, hiddenTestCases,startCode,
    referenceSolution,problemCreator
    }=req.body;

    try{

        for(const {language,completeCode} of referenceSolution){

        const languageId= await getLanguageById(language)

        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output
        }));
      

        const submitResult=await submitBatch(submissions);



        const resultToken = submitResult.map((value)=>value.token);
        const testResult = await submitToken(resultToken);
        for(const test of testResult){
            if(test.status_id!=3){
               return res.status(400).send("Error in your test result");
            }     
        }


        }


         const userProblem = await Problem.create({
            ...req.body,
            problemCreator:req.result._id
         });


    res.status(201).send("Problem Saved Successfully");

    }

    catch(error){
        res.status(400).send("Error")
    }


}

const updateProblem = async (req,res)=>{

 const {
     title,description,difficulty,tags,visibleTestCases, hiddenTestCases,startCode,
    referenceSolution,problemCreator
    }=req.body;

    const {id} = req.params;

    try{

        if(!id){
            res.status(400).send("ID is not found");
        }

        const ProblemID = await Problem.findById(id);

        if(!ProblemID){
            return res.status(404).send("ID is not present in server")
        }


        for(const {language,completeCode} of referenceSolution){

        const languageId=getLanguageById(language)

        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output
        }));
      

        const submitResult=await submitBatch(submissions);



        const resultToken = submitResult.map((value)=>value.token);
        const testResult = await submitToken(resultToken);
        for(const test of testResult){
            if(test.status_id!=3){
               return res.status(400).send("Error in your test result");
            }     
        }


        }


        const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true})


            res.status(201).send(newProblem);

    }

    catch(err){

        res.status(404).send("Error: Problem not updated" + err);

    }
}

const deleteProblem = async(req,res)=>{

const {id} = req.params;
try{
    if(!id){
        return res.status(404).send("ID is Missing");
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if(!deletedProblem){
        return res.status(404).send("Problem not Deleted")
    }

    res.status(201).send("Problem deleted successfully");
}
catch(err){
     res.status(500).send("Error",err);
}

}

const getProblemById = async(req,res)=>{

const {id} = req.params;
try{
    if(!id){
        return res.status(404).send("ID is Missing");
    }

    const getProblem = await Problem.findById(id);

    if(!getProblem){
        return res.status(404).send("Problem not found")
    }
    res.status(200).send(getProblem);
}
catch(err){
    res.status(500).send("Error",err);
}

}

const getAllProblem = async(req,res)=>{

try{
  
    const getAllProblem = await Problem.find({}).select("_id title difficulty tags ");
    //we use skip and spilit to repersent tat how many problem we want to show

    if(getAllProblem.length==0){
        return res.status(404).send("Problem not found")
    }

    res.status(200).send(getAllProblem);
}
catch(err){
    res.status(500).send("Error",err);
}

}

const solvedAllProblemByUser = async (req,res)=>{
   
    try{
        const userId= req.result._id;
        const user=await User.findById(userId).populate({
            path:"problemSolved",
            select:"_id title difficulty tags "
        });
       
        const count =req.result.problemSolved.length;
       res.status(200).send({
        count,
        user: user.problemSolved
       });
    }

    catch(error){
        res.status(500).send("Internal server error ",+error);
    }
}

const runcode = async(req,res)=>{
    
 try{
         const userId = req.result._id;
         const problemId = req.params.id;
       
         const {code , language} = req.body;

         if(!userId||!problemId ||!language){
           return res.status(404).send("Some field missing");
         }

         const problem = await Problem.findById(problemId);
          

         const languageId  = await getLanguageById(language);
          const submissions = problem.visibleTestCases.map((testcase)=>({
            source_code:code,
            language_id:languageId,
            stdin:testcase.input,
            expected_output:testcase.output
        }));

         const submitResult = await submitBatch(submissions);

         const resultToken = submitResult.map((value)=>value.token);

         const testResult = await submitToken(resultToken);

        res.status(201).send(testResult);

    }

    catch(error){
        res.status(500).send("Internal server error "+ error);

    }


}




module.exports={createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,runcode}