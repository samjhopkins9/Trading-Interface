// Alpha Vantage API Key - DO68WZE2817TOTSX



// Information determining data to fetch from API

// symbol may be changed by program; interval remains constant
let symbol = "SPY";
const interval = "1min";

// ticker prices may be changed by program; federal funds rate is constant;
// news may be changed by program, and will fetch general news if given the symbols of two particular high-option-volume index ETFs, and stock-specific news otherwise
let ticker_prices = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&outputsize=full&apikey=DO68WZE2817TOTSX`;
const treasury_yield = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=monthly&maturity=3month&apikey=DO68WZE2817TOTSX`;
let news = (symbol === "SPY") || (symbol === "QQQ") ? `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=DO68WZE2817TOTSX` : `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=DO68WZE2817TOTSX`;

// global date when taking current time in black-scholes calculation
const dateGLOBAL = new Date();

// risk-free interest rate and date from most recent increase saved as global variables
let rf_dateGLOBAL = 0;
let rf_rateGLOBAL = 0;





// Textbox and event listener for symbol

// adds "Trading" heading with textbox and button to top of trading section of document
document.getElementById("par").innerHTML += `<div id="parhead"><h1>Trading</h1><input type="text" value="SPY" id="symbolinp"><button id="symbolbutton">Go</button></input></div>`;

// defines style and spacing rules for header/textbox/button
document.getElementById("parhead").style.display = "flex";
document.getElementById("parhead").style.flexDirection = "row";
document.getElementById("parhead").style.justifyContent = "space-between";

// event handler updates global info to pertain to entered symbol on click of button
document.getElementById("symbolbutton").addEventListener("click", function(event){
    
    // updates symbol to be textbox value
    symbol = document.getElementById("symbolinp").value;
    
    // updates global link variables to pertain to textbox value
    ticker_prices = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&outputsize=full&apikey=DO68WZE2817TOTSX`;
    news = (symbol === "SPY") || (symbol === "QQQ") ? `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=DO68WZE2817TOTSX` : `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=DO68WZE2817TOTSX`;
    
    // clears html from main body sections of trading and news
    clearHTML(document.getElementById("basicinfo"));
    clearHTML(document.getElementById("stories"));
    
    // reloads html to main body sections of trading and news with new info
    run();
    
}); // end of event handler function





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
               
            // log data to console to see directly what comes from api
            console.log(data);
            
            // function handles data, several handling functions are defined below for different input streams
            handling_function(data, indata);
            
            
      }) // end of .then

      .catch(error => {
          
        console.error("Error:", error);
          
      }); // end of .catch
    
    
} // end of get_data function


// function loads each entry of the given array of text into the element given by the id parameter as 'p' elements
function loadHTML(text, id) {
    
    let d1 = document.createElement('div');
    
    // creates a p element for every string in the list, appends it to the new div
    for (let i=0; i<text.length; i++){
        
        let p = document.createElement('p');
        p.innerHTML = text[i];
        d1.appendChild(p);
        
    } // end of for loop
    
    document.getElementById(id).appendChild(d1);
    
} // end of loadHTML function


// function checks if an element is in the document, then removes all its children
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
    
    // removes timer if it already exists so it can be updated with new time
    if (document.getElementById('timer')){
        
        document.getElementById('head1').removeChild(document.getElementById('timer'));

    } // end of if
    
    // creates header to display full date and time
    let h1 = document.createElement('h1');
    
    // ternary operators to check if length of seconds or minutes is less than 10, and if it is, add a "0" to the string before the number to get a full time output
    h1.innerHTML = date.getMinutes() >= 10 ? `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}` : `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:0${date.getMinutes()}`;
    h1.innerHTML += date.getSeconds() >= 10 ? `:${date.getSeconds()}` : `:0${date.getSeconds()}`;
    
    h1.id = 'timer';
    
    // appends clock to header
    document.getElementById('head1').insertBefore(h1, infobutton);
    
} // end of load_time function

// function loads first 10 stories into the dom
function newsfeed (input) {
    
    let lines = [];
    let images = [];
        
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


// function loads risk-free interest rate data into dom,
// then executes function to load stock and option data into the dom using the current rate
function rf_rate(nums, indata = []){
    
    rf_rateGLOBAL = nums['data'][0]['value'];
    rf_dateGLOBAL = nums['data'][0]['date'];
    
    let basicinfo = document.createElement('div');
    basicinfo.id = "basicinfo";
    
    document.getElementById("par").appendChild(basicinfo);
    
    loadHTML([`3-month treasury bond yield as of ${nums['data'][0]['date']}: ${rf_rateGLOBAL}%`], 'basicinfo');
    
    get_data(ticker_prices, quotes, [rf_rateGLOBAL]);
    
} // end of fed_rate function


// function reloads interest rate into doc using already saved global variable (so new API call does not have to be made)
function reload_rate(){
    
    let basicinfo = document.createElement('div');
    basicinfo.id = "basicinfo";
    document.getElementById("par").appendChild(basicinfo);
    
    loadHTML([`1-month Federal Funds Rate as of ${rf_dateGLOBAL}: ${rf_rateGLOBAL}%`], 'basicinfo');
    
} // end reload_rate function






// function loads a chart onto the canvas element with the given id, label, x axis data, and y axis labels,
// with the extra parameter present to pass the initial price of the underlying into the function when creating a random walk chart
function load_chart(label1, x_axis, y_axis, id, extra = []){
    
    // removes canvas with given id, then creates new one
    // done to prevent error given by reusing same canvas for different charts
    document.getElementById(id).remove();
    let mainchart = document.createElement("canvas");
    mainchart.id = id;
    
    // declares a constant ctx as the canvas, and loads a chart onto it
    const ctx = mainchart;

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: x_axis,
          datasets: [{
            label: label1,
            data: y_axis,
            borderWidth: 1,
            pointRadius: 0.5
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    
    // if it is the random chart, it always inserts BEFORE the rsi chart and creates an event handler to load a new chart
    // also adds event listener so random chart updates every time it is clicked
    if (id === "randomchart"){
        
        // document.getElementById("chart").appendChild(mainchart);
        document.getElementById("chart").insertBefore(mainchart, document.getElementById("rsichart"));
        document.getElementById('randomchart').addEventListener("click", function(event){
            
            load_chart("Random Walk (click to refresh)", x_axis, load_randchart(x_axis.length, extra[0]), 'randomchart', [extra[0]]);
            
        }); // end of event handler
        
        return;
        
    } // end of if
    
    // otherwise, just appends the created chart to the main chart section of the document
    document.getElementById("chart").appendChild(mainchart);
    
} // end of load_chart function





// function saves all closing prices for a ticker from least to most recent as an indexed array,
// then displays and processes data into volatility indicators and Black-Scholes options prices
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
    
    
    
    // information pertaining to RSI graph is declared
    let rsi_units = 14;

    let rsi = RSI(prices, rsi_units);
    let rsilabels = [];
    
    // loop creates new list of date strings with length rsi_units less than full length so axes match in RSI graph
    for (let i=0; i<keys.length-rsi_units; i++){
        
        rsilabels.push(keys[i]);
        
    } // end of for loop
    
    
    
    // loads charts in order, random walk chart always inserts ahead of RSI but otherwise order matters
    load_chart(`${nums["Meta Data"]["2. Symbol"]}`, keys.reverse(), prices.reverse(), 'pricechart');
    load_chart("RSI", rsilabels.reverse(), rsi.reverse(), 'rsichart');
    load_chart("Random Walk (click to refresh)", keys, load_randchart(keys.length, prices[prices.length-1]), 'randomchart', [prices[prices.length-1]]);
    
    
    
    // loads symbol and last update directly from API date into dom
    loadHTML([ `${nums["Meta Data"]["2. Symbol"]} (last updated ${lastupdate})`], 'basicinfo');
    
    // calculates and loads annualized standard deviation of minutely logarithmic returns for dataset
    let SD_returns = SDreturns(prices);
    loadHTML([`Volatility over dataset: ${(SD_returns*100).toFixed(2)}%`, `(annualized standard deviation of minutely log returns)`], 'basicinfo');
    
    
    
    // contains all elements controlled by the slider ivslider element, which are also controlled by the slider element
    // method on options calculator class loads everything on table into "child" html element, which must be initialized and then cleared before every refresh
    let child = document.createElement('div');
    child.id = "child";
    
    // sliderlabel for slider controlling number of minutes to trade
    
    let sliderlabel = document.createElement("p");
    
    let slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "20";
    slider.value = "5";
    slider.id = "minutes1";
    
    // appended to basicinfo div, right below the interest rate, symbol and price
    document.getElementById("basicinfo").appendChild(sliderlabel);
    let min = parseInt(slider.value);
    sliderlabel.textContent = `Minutes to trade: ${min}`;

    document.getElementById('basicinfo').appendChild(slider);
    
    // event handler sets new value, clears HTML for child element (containing options price table),
    // updates the HTML with the new value
    slider.addEventListener("input", function (event) {
       
        slider.value = event.target.value;
        clearHTML(child);
        load_prices();

    }); // end of event handler
    
    
    
    // percslider controlling percentage of reach to capture
        
    let percslider = document.createElement("input");
    percslider.type = "range";
    percslider.min = "30";
    percslider.max = "200";
    percslider.step = "0.01";
    percslider.value = "70";
    percslider.id = "percslider";
    
    // percslider appended to basicinfo below other slider,
    // handling function of other executes so information it affects appears above slider
    let percentage = parseFloat(percslider.value);
    
    document.getElementById('basicinfo').appendChild(percslider);
    
    // event handler sets new value, clears the child element controlled by the slider, then reloads the HTML with the new value
    percslider.addEventListener("input", function(event) {
       
        percslider.value = event.target.value;
        clearHTML(child);
        load_prices();

    });
    
    
    
    // ivsliderlabel for ivslider controlling implied volatility of contracts in calculation
    
    let ivsliderlabel = document.createElement('p');
    
    let ivslider = document.createElement("input");
    ivslider.type = "range";
    ivslider.min = "5";
    ivslider.max = "50";
    ivslider.step = "0.01";
    ivslider.value = "20";
    ivslider.id = "ivslider";
    
    // ivsliderlabel and ivslider appended to basicinfo below other slider,
    // handling function of other executes so information it affects appears above slider
    document.getElementById('basicinfo').appendChild(ivsliderlabel);
    let iv = parseFloat(ivslider.value);
    ivsliderlabel.textContent = `Implied volatility of contracts: ${iv}%`;
    
    document.getElementById('basicinfo').appendChild(ivslider);
    
    // event handler sets new value, clears the child element controlled by the slider, then reloads the HTML with the new value
    ivslider.addEventListener("input", function(event) {
       
        ivslider.value = event.target.value;
        clearHTML(child);
        load_prices();

    });
    
    
    
    // daystoexplabel for daysslider controlling days to expiry of contracts
    
    let daystoexplabel = document.createElement('p');
    
    let daysslider = document.createElement("input");
    daysslider.type = "range";
    daysslider.value = "0";
    daysslider.min = "0";
    daysslider.max = "5";
    daysslider.id = "daysslider";
    
    // daystoexplabel and daysslider appended to basic info below other slider,
    // handling function executes so other info is appended above slider
    document.getElementById('basicinfo').appendChild(daystoexplabel);
    let days = parseInt(daysslider.value);
    daystoexplabel.textContent = `Days to expiry: ${days}`;
    
    document.getElementById('basicinfo').appendChild(daysslider);
    
    // event handler sets new value, clears child element controlled by sliders, then reloads with the HTML with new value
    daysslider.addEventListener("input", function(event){
        
        daysslider.value = event.target.value;
        clearHTML(child);
        load_prices();
         
    }); // end of event handler
    
    
    
    // loads current price into child2 element, as p element above table
    loadHTML([`Current price: ${(prices[prices.length-1]).toFixed(2)}`], 'basicinfo');
    
    
    
    load_prices();
    
    // function appends child element containing everything controlled by slider,
    // processes and appends processed data to the child element
    function load_prices() {
        
        // updates minute value to be value of slider
        min = parseInt(slider.value);
        percentage = parseFloat(percslider.value);
        // updates days value as slider value
        days = parseInt(daysslider.value);
        // updates implied volatility value as slider value
        iv = parseFloat(ivslider.value);
        
        
        // updates text content for slider label
        sliderlabel.textContent = `Minutes to trade: ${min}`;
        // updates text content for slider label
        ivsliderlabel.textContent = `Implied volatility of contracts: ${iv}%`;
        // updates text content for slider label
        daystoexplabel.textContent = `Days to expiry: ${days}`;
        
        
        
        // calculates average reach for the given # minutes over the given dataset
        let reach = Reach(prices, min);
        let tgt = reach[0]*percentage;
        
        
        // div element containing basic text info controlled by minutes slider
        let childinfo = document.createElement('div');
        childinfo.id = "childinfo";
        childinfo.innerHTML = ` <p>Average / SD ${min} minute reach: ${(reach[0]*100).toFixed(4)}% / ${(reach[1]*100).toFixed(4)}%</p>
                                <p>(largest deviation from a pricepoint within the following ${min} minutes)</p>
                                <p>Targeted movement: ${tgt.toFixed(4)}% over ${min} minutes (${percentage}% of average reach)</p>`;
        
        
        // info controlled by minutes slider is deleted if already present
        if (document.querySelector("#childinfo")){
            
            document.getElementById("childinfo").remove();
            
        } // end of if
        
        
         // inserts childinfo controlled by minutes slider into basicinfo section before ivslider
        document.getElementById('basicinfo').insertBefore(childinfo, percslider);
        
        
        
        // appends child2 within basicinfo element,
        // either for first time or after code has been cleared by event handler
        document.getElementById('basicinfo').appendChild(child);
        
        let divyield = symbol == "SPY" ? 0.0151 : 0.0;
        
        // if within trading hours, calculate prices with time to expiry accounting for hours of current day;
        // if not, calculate 0 day expiry prices for contracts at 9:40 AM
        if ((dateGLOBAL.getHours() >= 10 && dateGLOBAL.getHours() <= 15) || (dateGLOBAL.getHours() === 9 && dateGLOBAL.getMinutes() >= 30)){
            
            
            let t1 = new Trade(prices[prices.length-1], iv, iv, exp_time(`${dateGLOBAL.getHours()}:${dateGLOBAL.getMinutes()}`, days), indata[0]/100.0, divyield, reach[0]*percentage, min);
            t1.loadHTML(11, 3);
            // t1.print();
            
        } else {
            
            let t1 = new Trade(prices[prices.length-1], iv, iv, exp_time(`15:59`, days), indata[0]/100.0, divyield, reach[0]*percentage, min);
            t1.loadHTML(11, 3);
            // t1.print();
            
        } // end of if-else
        

    } // end of load_prices function
    
        
} // end of quotes function
                     
                  



// Running portion of code
   
// runs load_time every second to have live-updating clock
setInterval(load_time, 1000);

// fetches data from federal funds, which includes process to fetch and processes data from stock quotes
get_data(treasury_yield, rf_rate);

// fetches data from newsfeed
get_data(news, newsfeed);



// reloads interest rate into DOM without re-fetching data, then
// re-fetches ticker and news data for newly entered symbol
// run in symbol textbox event handler function
function run (){
    
    reload_rate();
    get_data(ticker_prices, quotes, [rf_rateGLOBAL]);
    get_data(news, newsfeed);
    
} // end of run function

