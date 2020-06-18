let puppeteer= require("puppeteer");
let fs= require("fs");
let credentialsFile= process.argv[2];
let LnCList= require("./LnCList");
const followList = require("./followList");
let mainLink= "https://www.instagram.com/";

(async function(){
    let data= await fs.promises.readFile(credentialsFile, "utf-8");
    let details= JSON.parse(data);
    login= details.login;
    email= details.email;
    pwd= details.pwd;

    let browser= await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized", "--disable-notifications"]
    });

    let numberOfPAges= await browser.pages();
    let tab= numberOfPAges[0];
    await tab.goto(login, {waitUntil: "networkidle0"});
    //login id and password
    await tab.waitForSelector('input[name="username"]');
    await tab.type('input[name="username"]', email, { delay: 100 });
    await tab.waitForSelector('input[name="password"]');
    await tab.type('input[name="password"]', pwd, { delay: 100 });
    
    //login button
    await tab.waitForSelector("button[type='submit']");
    await navigationHelper(tab, "button[type='submit']");
    //save details button
    await tab.waitForSelector("button[type='button']");
    await navigationHelper(tab, "button[type='button']");

    for(let i=0 ; i<LnCList.length ; i++){
        //search username
    //  await tab.waitForSelector("input[placeholder='Search']", {delay: 200});
    //  await tab.type("input[placeholder='Search']", LnCList[i], {delay: 50});
    //  await tab.waitForSelector(".z556c");
    //  await navigationHelper(tab, ".z556c");

     let pageLink= mainLink + followList[i];
     let pageTab= await browser.newPage();
     await pageTab.goto(pageLink, {waitUntil: "networkidle0"});


        //select post 
     await pageTab.waitForSelector(".v1Nh3 a");
     let postOnPage= await pageTab.$$(".v1Nh3 a");
     let postToLike= fs.readFileSync("./commands/postToLike.txt", "utf-8");
     let commentToDo= fs.readFileSync("./commands/commentToDo.txt", "utf-8");
     console.log("Page: " + followList[i]);
     for(let i=0 ; i<postToLike ; i++){
        let link= await pageTab.evaluate(function(q){
            return q.getAttribute("href");
        }, postOnPage[i]);
    
        let cLink= "https://www.instagram.com" + link;
        let newTab= await browser.newPage();
        await newTab.goto(cLink, {waitUntil: "networkidle0"});
        let unlike= await newTab.$$("svg[fill='#ed4956']");
        if(unlike.length == 1){
            console.log("Already liked and commented");
        } else{
            //to like
            await newTab.click(".fr66n");
            console.log("Post liked");

            //to comment
            await newTab.waitForSelector(".X7cDz");
            await newTab.click(".X7cDz")
            await newTab.type(".X7cDz", commentToDo, {delay: 100});
            await newTab.keyboard.press("Enter", {delay:100});
            console.log("Comment done");

            
    
        }
        
        await newTab.close();
        
    }
       console.log();
       await pageTab.close();
    }
}
)();

async function navigationHelper(tab, selector){
    await Promise.all([tab.waitForNavigation({
        waitUntil: "networkidle2"
        
    }), await tab.click(selector)]);
}