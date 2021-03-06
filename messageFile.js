let puppeteer= require("puppeteer");
let fs= require("fs");
let credentialsFile= process.argv[2];
let followList= require("./messageList");
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

    

    for(let i=0 ; i<followList.length ; i++){
        let pageLink= mainLink + followList[i];
        let newTab= await browser.newPage();
        await newTab.goto(pageLink, {waitUntil: "networkidle0"});
        await newTab.waitForSelector("._862NM");
        await navigationHelper(newTab, "._862NM");

        let toSend= fs.readFileSync('./commands/textToSend.txt', 'utf-8');

        await newTab.waitForSelector(".ItkAi");
        await newTab.type(".ItkAi", toSend, {delay:100});
        await newTab.keyboard.press("Enter", {delay:200});
        console.log("Message sent to: " + followList[i]);
        await newTab.close();
    }

}
)();

async function navigationHelper(tab, selector){
    await Promise.all([tab.waitForNavigation({
        waitUntil: "networkidle2"
        
    }), await tab.click(selector)]);
}