
const axios = require('axios');

const getLanguageById = (lang)=>{

    const language={
"c++":54,
"java":62,
"javaScript":63
    }
return language[lang.toLowerCase()];

}

const submitBatch = async (submissions)=>{

    const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': 'f7a4bcd4bdmsh06bf7791aef0572p1c11b2jsn1c91e92de6de',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

   return await fetchData();

}


const waiting = (timer) => new Promise(resolve => setTimeout(resolve, timer));


const submitToken = async (resultToken)=>{

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': 'f7a4bcd4bdmsh06bf7791aef0572p1c11b2jsn1c91e92de6de',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

while(true){

    const result = await fetchData();
    const testResult = result.submissions.every((r)=>r.status_id>2);
    if(testResult)
    return result.submissions;

    await waiting(1000);

}
    
}


module.exports = {getLanguageById,submitBatch,submitToken}