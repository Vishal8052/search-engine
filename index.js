//Requiring the modules -> It should always be done on the top
const express = require("express");
const path = require("path");
const fs = require("fs");

//Creating our server
const app = express();

app.use(express.json());

//Setting Up EJS

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));

const PORT = process.env.PORT || 3000;

// GET, POST, PATCH, DELETE

//@GET /
//problemTextcription: GET request to home page
app.get("/", (req, res) => {
  res.render("index");
});


//get the search request
app.get("/search", (req, res) => {
  const query = req.query;
   var question =query.question.toString().replace(/[^a-zA-Z ]/g, "");
   question= question.toString().toLowerCase();


  //TF-IDF ALgo
    // console.log(question);

    //Array of queries
    const input_array = question.split(" ");
    const titles = fs.readFileSync('./docs/titles.txt','utf8').replace(/\r\n/g,'\n').split('\n');
    // console.log(titles.length)
    const arr=[];

       
       //Match with titles if problem has been searched by name
       if(input_array.length<6){
       var objj={};
       for(let j=0;j<titles.length;j++)
       {
            const titleString = titles[j].toLocaleLowerCase();

            if(titleString.includes(question)){
            const idx=j+1;
            const url = "/problem/"+idx+"/";
            const line = fs.readFileSync('./docs/probs/'+idx+'.txt' ,'utf8').split('\n').shift();
            objj={
              id_: idx,
              title: titles[idx-1],
              url: url,
              statement: line,
              };
          }
       }

       if(objj.id_ && objj.title && objj.url && objj.statement)
        arr.push(objj);
      }

       

    //Get all the keywords
    var keywords = fs.readFileSync('./docs/All_Keywords.txt','utf8').replace(/(\r\n|\n|\r)/gm, " ");
    const all_keywords = keywords.split(' ');

    //count the number of occurences
    const counts={};

    for (let i=0;i<all_keywords.length;i++)
    {
        counts[all_keywords[i]]=0;
    }

    for (let i=0;i<all_keywords.length;i++)
    {
        for(let j=0;j<input_array.length;j++)
        {
          if(all_keywords[i]==input_array[j])
          {
              counts[all_keywords[i]]++;
          }
        }      
    }

   //array to store the tf values
   //tf = count of word / total Number of words

    const tf =[];

    for (let i=0;i<all_keywords.length;i++)
    {
        if(counts[all_keywords[i]])
        {
            tf[i]=(counts[all_keywords[i]]/input_array.length);
        }
        else
        tf[i]=0;
    }

    

    

    var idf_string = fs.readFileSync('./docs/IDF-MATRIX.txt','utf8').replace(/(\r\n|\n|\r)/gm, " ");
    const idf=idf_string.split(' ');

    // console.log(idf);
  

   //Now calculate TD-IDF value of the query string

    const tfIdf=[];
    var sum=0;

    for(let i = 0;i<idf.length;i++)
    {
        tfIdf[i]=0;
        if(idf[i]!=NaN)
        tfIdf[i]=(idf[i])*tf[i];
        else 
         tfIdf[i]=0;
        sum+=tfIdf[i]*tfIdf[i];
    }

    
    // console.log(tfIdf);
    //get the tf-idf values of the dataset

    var tfidfss = fs.readFileSync('./docs/tf-idf-data-set.txt','utf8').split('\n');
    // console.log(tfidfss.length);

    var tfidfs=[];

   var mods=[];  //array to contain absolute value of the vectors which will be used in cosine similarity
   for(var i=0;i<tfidfss.length-1;i++)
   {
     if(!tfidfss[i])
     {
        continue;
     }
      var tfidfii = tfidfss[i].split(' ');
      if(tfidfii)
        tfidfs.push(tfidfii);
      var sum=0;
      for(var j=0;j<tfidfii.length;j++)
      {
          sum+=tfidfii[j]*tfidfii[j];
      }
      mods.push(sum);
   }


  //CALCULATE THE PRODUCTS of tf-idf values of dataset and query
  const cosin=[];

  for(var i=0;i<tfidfs.length;i++)
  {
    if(!tfidfs[i])continue;
     var val=0;
     if(mods[i]==0 || sum==0)
     {
       val=0;
       continue;
     }
     for(var j=0;j<tfIdf.length;j++)
     {
        val+=(tfIdf[j]*tfidfs[i][j])/(Math.sqrt(sum)*Math.sqrt(mods[i]));
     }

     const obj = {
       first:val,
       second:i+1
     }

     cosin.push(obj);
  }


  var cosine = cosin.sort(function(a,b){return (b.first-a.first);});
  
  var n = cosine.length;


  
  for(var i =0;i<n && arr.length<5;)
  {
    const idx = cosine[i].second;
    const url = "/problem/"+idx+"/";
    const line = fs.readFileSync('./docs/probs/'+idx+'.txt' ,'utf8').split('\n').shift();

    const obj={
        id_: idx,
        title: titles[idx-1],
        url: url,
        statement: line,
    };
    arr.push(obj);
    i++;
  }


  //List of 5 questions
  //  console.log(arr);
  //  console.log(cosine);
  
  setTimeout(() => {
    res.json(arr);
  }, 100);
});


app.get("/problem/:id",(req,res)=>
{
  // var id = req.params.id;
  // console.log(id);
  // var problemText =  fs.readFileSync('./docs/probs/'+id+'.txt','utf8').toString();
     try{
      var id = req.params.id;
      
      var titleArray = fs.readFileSync('./docs/titles.txt','utf8').replace(/\r\n/g,'\n').split('\n');
      
      var tit = titleArray[id-1];

      var siteArray = fs.readFileSync('./docs/links.txt','utf8').replace(/(\r\n|\n|\r)/gm, " ").split(' ');
      var site = siteArray[id-1];

      var problemText =  fs.readFileSync('./docs/probs/'+id+'.txt','utf8').toString();

    function decode_utf8(s) {
      return decodeURIComponent(escape(s));
    }
    decode_utf8(problemText);
    problemText = problemText.replace(/\n/g, "<br />");


    res.render('problem.ejs',{

        title:tit,
        url:site,
        content:problemText});
      // res.render(problemText);
      }
      catch(err)
      {
        console.log(err);
      }

    // res.send(problemText);

});



//Assigning Port to our application
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});


module.exports = app;