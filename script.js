// Alpha Vantage API Key - DO68WZE2817TOTSX

// Information determining data to fetch from API

const symbol = "SPY";
const interval = "1min";

const ticker_prices = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&outputsize=full&apikey=DO68WZE2817TOTSX`;

const federal_funds = `https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&interval=monthly&apikey=DO68WZE2817TOTSX`;

const news = symbol == "SPY" ? `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=DO68WZE2817TOTSX` : `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=DO68WZE2817TOTSX`;

const dateGLOBAL = new Date();


// textbox and event listener for symbol

// Data fetching and handling portion of code

// function fetches and handles data from an API using a url and a data handling function as parameters
function get_data(url, handling_function, indata = []){
    
    fetch(url)

        .then(response => {
          
            if (response.ok) {
            
                return response.json(); // Parse the response as JSON
            
            } else {
                
                throw new Error("Request was not successful. Status code: " + response.status);
                
            } // end of else
            
        }) // end of .then

        .then(data => {
          
            // Process and use the data as needed
                            
            console.log(data);
            
            handling_function(data, indata);
            
            
      }) // end of .then

      .catch(error => {
          
        console.error("Error:", error);
          
      }); // end of .catch
    
    
} // end of get_data function

// function loads each entry of the given array of text into the element given by the id parameter as 'p' elements
function loadHTML(text, id) {
    
    let d1 = document.createElement('div');
    
    for (let i=0; i<text.length; i++){
        
        let p = document.createElement('p');
        p.innerHTML = text[i];
        d1.appendChild(p);
        
    } // end of for loop
    
    document.getElementById(id).appendChild(d1);
    
} // end of loadHTML function

function clearHTML(element){
    
    if (!element){
        
        return;
        
    } // end of if
    
    while (element.firstChild){
        
        element.removeChild(element.firstChild);
        
    } // end of while loop
    
} // end of clearHTML function


// function loads date and time onto a header
function load_time(){
    
    const date = new Date();
    
    if (document.getElementById('timer')){
        
        document.getElementById('head1').removeChild(document.getElementById('timer'));

    } // end of if
    
    let h1 = document.createElement('h1');
    h1.innerHTML = date.getMinutes() >= 10 ? `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}` : `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:0${date.getMinutes()}`;
    h1.innerHTML += date.getSeconds() >= 10 ? `:${date.getSeconds()}` : `:0${date.getSeconds()}`;
    h1.id = 'timer';
    
    document.getElementById('head1').appendChild(h1);
    
} // end of load_time function

function newsfeed (input) {
    
    let lines = [];
    let images = [];
    
    document.getElementById('news').innerHTML += `<h1>News</h1>`;
    
    let stories = document.createElement('div');
    stories.id = 'stories';
    document.getElementById('news').appendChild(stories);
    
    for (let i=0; i<10; i++){
        
        let div1 = document.createElement('div');
        div1.className = 'newsstory';
        div1.innerHTML += `<p>${input['feed'][i].summary} | <a href=\"${input['feed'][i].url}\" target=\"_BLANK\">${input['feed'][i].source}</a></p>`;
        div1.innerHTML += `<img src=\"${input['feed'][i].banner_image}\" width='66' height='46'></img>`;
        document.getElementById('stories').appendChild(div1);
        
    } // end of for loop
    
    
    loadHTML(lines, 'stories');
    // loadHTML(images, 'stories');
    
} // end of newsfeed function

function rf_rate(nums, indata = []){
    
    let rate = nums['data'][0]['value'];
        
    // console.log(`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`);
    // console.log(`1-month Federal Funds Rate as of ${nums['data'][0]['date']}: ${rate}%`);
    
    document.getElementById('par').innerHTML += `<h1>Trading</h1>`;
    loadHTML([`1-month Federal Funds Rate as of ${nums['data'][0]['date']}: ${rate}%`], 'par');
    
    get_data(ticker_prices, quotes, [rate]);
    
} // end of fed_rate function


// function saves all closing prices for a ticker from least to most recent as an indexed array
function quotes(nums, indata = []){
    
    let keys = [];
    // loops through data, saves each key in a string in order so values can be printed via loop
    for (const d in nums[`Time Series (${interval})`]){
      
        keys.push(d);
      
    } // end of for loop
  
    let prices = [];
    let i = 0;
    var lastupdate;
    for (const d of keys){
      
        prices.push(parseFloat(nums[`Time Series (${interval})`][d]["4. close"]));
        if (i === 0) {
            
            lastupdate = d;
            i++;
            
        } // end of if
      
    } // end of for loop
    
    
    loadHTML([ `${nums["Meta Data"]["2. Symbol"]} (last updated ${lastupdate})`], 'par');
    
    let SD_returns = SDreturns(prices, 5000);
    loadHTML([`Volatility over last 1M: ${(SD_returns*100).toFixed(2)}%`, `(annualized standard deviation of minutely log returns for the last month)`], 'par');
            
    let child = document.createElement('div');
    child.id = 'child';
    
    let sliderlabel = document.createElement("p");
    
    let slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "20";
    slider.value = "5";
    slider.id = "minutes1";
    
    document.getElementById('par').appendChild(sliderlabel);
    let min = parseInt(slider.value);
    sliderlabel.textContent = `Minutes to trade: ${min}`;

    document.getElementById('par').appendChild(slider);
    
    slider.addEventListener("input", function (event) {
       
        slider.value = event.target.value;
        clearHTML(child);
        load_prices();
        
    });
    
    let ivsliderlabel = document.createElement('p');
        
    let ivslider = document.createElement("input");
    ivslider.type = "range";
    ivslider.min = "5";
    ivslider.max = "50";
    ivslider.value = "20";
    ivslider.id = "ivslider";
    
    let iv = parseFloat(ivslider.value);
    ivsliderlabel.textContent = `Implied volatility of contracts: ${iv}%`;
    
    load_prices();
    
    function load_prices() {
        
        document.getElementById('par').appendChild(child);
        
        min = parseInt(slider.value);
        sliderlabel.textContent = `Minutes to trade: ${min}`;
        
        let reach = Reach(prices, min);
        
        loadHTML([`Average / SD ${min} minute reach: ${(reach[0]*100).toFixed(4)}% / ${(reach[1]*100).toFixed(4)}%`, `(largest deviation from a pricepoint within the following ${min} minutes)`, `Targeted movement: ${(reach[0]*70).toFixed(4)}% over ${min} minutes (70% of average reach)`], 'child');
        
        document.getElementById('child').appendChild(ivsliderlabel);
        
        let child2 = document.createElement('div');
        child2.id = "child2";
        
        document.getElementById('child').appendChild(ivslider);
        
        ivslider.addEventListener("input", function(event) {
           
            ivslider.value = event.target.value;
            clearHTML(child2);
            load_ladders();
            
        });
        
        load_ladders();
        
        function load_ladders() {
            
            document.getElementById('child').appendChild(child2);
            
            iv = parseFloat(ivslider.value);
            
            ivsliderlabel.textContent = `Implied volatility of contracts: ${iv}%`;
            
            loadHTML([`Current price: ${prices[0]}`], 'child2');
            
            if ((dateGLOBAL.getHours() >= 10 && dateGLOBAL.getHours() <= 15) || (dateGLOBAL.getHours() === 9 && dateGLOBAL.getMinutes() >= 30)){
                
                // make minutes, volatility changeable using document elements
                let t1 = new Trade(prices[0], iv, iv, exp_time(`${dateGLOBAL.getHours()}:${dateGLOBAL.getMinutes()}`, 0), indata[0]/100, reach[0]*70, min);
                t1.loadHTML(12, 3);
                // t1.print();
                
            } else {
                
                let t1 = new Trade(prices[0], iv, iv, exp_time(`9:40`, 0), indata[0]/100, reach[0]*70, min);
                t1.loadHTML(12, 3);
                // t1.print();
                
            } // end of if-else
            
        } // end of load_ladders function

        
    } // end of load_prices function
    
    // add code to chart prices
    
        
} // end of stock function
                     
                             
// Running portion of code
                     
setInterval(load_time, 1000);
get_data(federal_funds, rf_rate);
get_data(news, newsfeed);
