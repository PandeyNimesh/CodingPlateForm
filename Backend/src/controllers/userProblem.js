const {getLanguageById,submitBatch}=require("../utils/problemUtility")


const createProblem=async(req,res)=>{

const {title,description,difficulty,tags,visibleTestCases,hiddenTestCases,
    startCode,referenceSolution,probleCreator}=req.body;

try{

    for(const {language,completeCode} of referenceSolution){

//format of judge zero
//source code
//language id
const languageId=getLanguageById(language);
// stdin
//expectedOutput
const submissions=visibleTestCases.map((data)=>({

    source_code:data.completeCode,
    language_id: data.languageId,
    stdin: input,
    expected_output:output


}));


const submitResult = submitBatch(submissions);

}

    }

   
   
    catch(err){


}

}



