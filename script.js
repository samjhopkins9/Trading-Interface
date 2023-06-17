// Alpha Vantage API Key - DO68WZE2817TOTSX

// Information determining data to fetch from API
const symbol = "SPY";
const interval = "1min";

const ticker_prices = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&outputsize=full&apikey=DO68WZE2817TOTSX`;

const federal_funds = `https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&interval=monthly&apikey=DO68WZE2817TOTSX`;

const news = symbol == "SPY" ? `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=DO68WZE2817TOTSX` : `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=DO68WZE2817TOTSX`;

const date = new Date();

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


function rf_rate(nums, indata = []){
    
    let rate = nums['data'][0]['value'];
        
    // console.log(`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`);
    // console.log(`1-month Federal Funds Rate as of ${nums['data'][0]['date']}: ${rate}%`);
    
    loadHTML([`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`, `1-month Federal Funds Rate as of ${nums['data'][0]['date']}: ${rate}%`], 'par');
    
    get_data(ticker_prices, quotes, [rate]);
    get_data(news, newsfeed);
    
} // end of fed_rate function

function newsfeed (input) {
    
    let lines = []
    
    for (let i=0; i<10; i++){
        
        lines.push(`${input['feed'][i].summary} | <a href=\"${input['feed'][i].url}\" target=\"_BLANK\">${input['feed'][i].source}</a>`);
        
    } // end of for loop
    
    loadHTML(lines, 'news');
    
} // end of newsfeed function


// function saves all closing prices for a ticker from least to most recent as an indexed array
function quotes(nums, indata = []){
    
    let keys = [];
    // loops through data, saves each key in a string in order so values can be printed via loop
    for (const d in nums[`Time Series (${interval})`]){
      
        keys.push(d);
      
    } // end of for loop
  
    let prices = [];
    for (const d of keys){
      
        prices.push(parseFloat(nums[`Time Series (${interval})`][d]["4. close"]));
      
    } // end of for loop
        
    loadHTML([nums["Meta Data"]["2. Symbol"]], 'par');
    
    let info = new stock_info(prices);
        
    if (date.getHours() >= 9 && date.getHours() <= 20){
        
        let t1 = new Trade(prices[0], 20, 20, exp_time(`${date.getHours()}:${date.getMinutes()}`, 0), indata[0]/100, info.reach[0]*70, 5);
        t1.loadHTML(10, 5);
        // t1.print();
        
    } else {
        
        let t1 = new Trade(prices[0], 20, 20, exp_time(`9:30`, 0), indata[0]/100, info.reach[0]*70, 5);
        t1.loadHTML(10, 5);
        // t1.print();
        
    } // end of if-else
    
    // add code to chart prices
    
        
} // end of stock function


class stock_info {
    
    constructor(prices){
        
        this.reach = reach(prices, 5);
        this.SD_returns = SD_returns(prices, 5000);
        
        /*
        console.log(`Intrinsic volatility over last 1M: ${this.SD_returns*100}%`);
        console.log(`Average / SD 5 minute reach: ${this.reach[0]*100}% / ${this.reach[1]*100}%`);
        console.log(`Targeted movement: ${this.reach[0]*70}% over 5 minutes`);
        console.log(`Current price: ${prices[0]}`);
        */
        
        loadHTML([`Intrinsic volatility over last 1M: ${this.SD_returns*100}%`, `Average / SD 5 minute reach: ${this.reach[0]*100}% / ${this.reach[1]*100}%`, `Targeted movement: ${this.reach[0]*70}% over 5 minutes`, `Current price: ${prices[0]}`], 'par');
        
        
    } // end of stock_info constructor
    
} // end of stock_info class


// function return average and sd reach over the given number of minutes for the given symbol over the given number of days
function reach(prices, min){
    
    let r = [];
        
    for (let i=0; i<prices.length-min; i++){
        
        let r1 = Math.abs((prices[i+min-1] - prices[i+min])/prices[i+min]);
        
        for (let c=min-1; c>=0; c--){
            
            if (Math.abs((prices[i+c] - prices[i+min]) / prices[i+min]) > r1){
                
                r1 = Math.abs((prices[i+c] - prices[i+min])/prices[i+min]);
                
            } // end of if statement
            
        } // end of for loop
        
        r.push(r1);
        
    } // end of for loop
    
    let avg = 0;
    
    for (let i=0; i<r.length; i++){
        
        avg += r[i];
        
    } // end of for loop
    
    avg /= r.length;
    
    let vari = 0;
    
    for (let i=0; i<r.length; i++){
        
        vari += Math.pow(r[i] - avg, 2);
        
    } // end of for loop
    
    vari /= r.length;
    
    return [avg.toFixed(5), Math.sqrt(vari).toFixed(5)];
    
} // end of reach function


function SD_returns(prices){
    
    let sd = 0;
    
    let avg_return = 0.0;
    let lr = [];
    
    for (let c=prices.length-2; c>=0; c--){
        
        avg_return += Math.log(prices[c]/prices[c+1]);
        lr.push(Math.log(prices[c]/prices[c+1]));
        
    } // end of for loop
    
    avg_return /= prices.length;
    
    let variance = 0;
    
    for (let c=prices.length-2; c>=0; c--){
        
        variance += Math.pow(lr[c] - avg_return, 2);
        
    } // end of for loop
    
    variance /= prices.length;
    
    sd = Math.sqrt(variance);
    
    let ratio = prices.length/28000 // 28000 minutes in full trading month; prices.length many represented in data
    
    return (sd*Math.sqrt(ratio * 960 * 250)).toFixed(4);
    
} // end of SD_returns function





// Black-Scholes portion of code

function normpdf (x){
    
    return (1.0 / (Math.sqrt(2.0 * Math.PI))) * Math.exp(-0.5 * x * x);
    
};

function normcdf(x) {
    
    let k = 1.0 / (1.0 + 0.2316419 * x);
    let k_sum = k * (0.319381530 + k * (-0.356563782 + k * (1.781477937 + k * (-1.821255978 + 1.330274429 * k))));
    
    if (x >= 0.0) {
        
        return (1.0 - (1.0 / (Math.sqrt(2.0 * Math.PI))) * Math.exp(-0.5 * x * x) * k_sum);
        
    } // end of if statement
    
    else {
        
        return 1.0 - normcdf(-x);
        
    } // end of else
    
} // end of normcdf function

function d1(S, K, r, sigma, T) {
    
    return (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    
} // end of d1 function

function d2(S, K, r, sigma, T) {
    
    return d1(S, K, r, sigma, T) - sigma * Math.sqrt(T);
    
} // end of d2 function

function black_scholes_call(S, K, r, sigma, T) {
                         
    let nd1 = normcdf(d1(S, K, r, sigma, T));
    let nd2 = normcdf(d2(S, K, r, sigma, T));
    return S * nd1 - K * Math.exp(-r * T) * nd2;
    
} // end of black_scholes_call function;

function black_scholes_put(S, K, r, sigma, T) {
                         
    let nd1 = normcdf(-d1(S, K, r, sigma, T));
    let nd2 = normcdf(-d2(S, K, r, sigma, T));
    return K * Math.exp(-r * T) * nd2 - S * nd1;
                         
} // end of black_scholes_put function

         
                     

                     
 
// code calculating and displaying options prices with certain movements and levels of time decay
// class stores a call and put price according to a set of the 5 given parameters
class Strike {
    
    constructor(S, K, V1, V2, T, R){
        
        this.underlying_price = S;
        this.strike_price = K;
        this.call_volatility = V1;
        this.put_volatility = V2;
        this.time = T;
        this.riskfree_rate = R;
        
        this.call_price = black_scholes_call(S, K, R, V1, T);
        this.put_price = black_scholes_put(S, K, R, V2, T);
        
    } // end of Strike constructor
    
} // end of Strike class


let ladder = (S, V1, V2, T, R, range) => {
        
    let l = [];
    
    for (let i=Math.floor(S)-range; i<=Math.floor(S)+range; i++){
            
        l.push(new Strike(S, i, V1, V2, T, R));
            
    } // end of for loop
        
    return l;
        
} // end of ladder function
      
                     
// returns time to expiry in hours, given the time of day and days to expiry of a contract
let exp_time = (time, day) => {
        
    let t = day*16;
    let add = 0;
        
        if (time[1] === ':'){
            
            let hour = `${time[0]}`
            let minute = `${time[2]}${time[3]}`;
            add = 20 - (parseInt(hour) + (parseInt(minute)/60));
            
        } else {
            
            let hour = `${time[0]}${time[1]}`;
            let minute = `${time[3]}${time[4]}`;
            add = 20 - (parseInt(hour) + (parseInt(minute)/60));
            
        } // end of if else
    
    return add+t;
        
} // end of exp_time function
      
// function stores pricing information for a set of call and put contracts for a symbol with specified parameters at a given price, a specified percentage higher over a certain time period, and the same lower
class Trade {
        
    constructor(S, V1, V2, T, R, m, t){
        
        V1 /= 100; // entered as percentage
        V2 /= 100; // entered as percentage
        
        this.time_exp = T / 4000; // entered as hours, calculated as as fraction of year
        // 4000 = number of hours in a trading year = 16*250
        this.movement = m / 100; // entered as a percentage
        this.time = t / 240000; // entered as minutes, calculated as fraction of a year
        // 240000 = number of minutes in a trading year 60*16*250
        
        this.initial_underlying = S;
        this.final_underlying = [(S+(S*this.movement)).toFixed(2), (S-(S*this.movement)).toFixed(2)];
            
        this.strike_prices = [];
        this.initial_prices = [[]];
        this.up_prices = [[]];
        this.down_prices = [[]];
        
        var l0 = ladder(S, V1, V2, this.time_exp, R, 10);
        var l1 = ladder(S+(S*this.movement), V1, V2, this.time_exp-this.time, R, 10);
        var l2 = ladder(S-(S*this.movement), V1, V2, this.time_exp-this.time, R, 10);
        
        for (let i=0; i<l0.length; i++){
            
            for (let j=0; j<l1.length; j++){
                
                for (let k=0; k<l2.length; k++){
                    
                    if (l0[i].strike_price === l1[j].strike_price && l1[j].strike_price === l2[k].strike_price){
                        
                        this.strike_prices.push(l0[i].strike_price);
                        this.initial_prices.push([l0[i].call_price.toFixed(2), l0[i].put_price.toFixed(2)]);
                        this.up_prices.push([l1[j].call_price.toFixed(2), l1[j].put_price.toFixed(2)]);
                        this.down_prices.push([l2[k].call_price.toFixed(2), l2[k].put_price.toFixed(2)]);
                        
                    } // end of if
                    
                } // end of for loop
                
            } // end of for loop
            
        } // end of for loop
            
    } // end of pairs constructor
        
        
    print(){
            
        let l = this.strike_prices.length;
        for (let i=8; i<l-3; i++){
            
            console.log(`${this.initial_underlying}     ${this.strike_prices[i]}   ${this.initial_prices[i][0]}   ${this.strike_prices[l-i+2]}   ${this.initial_prices[l-i+2][1]}`);
            console.log(`${this.final_underlying[0]}              ${this.up_prices[i][0]}             ${this.up_prices[l-i+2][1]}`);
            console.log(`${this.final_underlying[1]}              ${this.down_prices[i][0]}             ${this.down_prices[l-i+2][1]}`);
            console.log();

        } // end of for loop
        
        console.log();
            
    } // end of print function
        
        
    loadHTML(start, end){
            
        let table = document.createElement("table");
        table.id = "bigtable";
        
        let head = document.createElement('th');
        head.innerHTML = `Price +/- ${this.movement*100}% / Strike / Call Price // Strike / Put Price`;
        table.appendChild(head);
        
        let l = this.strike_prices.length;
        
        for (let i=start; i<l-end; i++){
            
            let table2 = document.createElement("table");
            table2.id = "smalltable";
            
            let c1 = document.createElement("tr");
            c1.className = 'firstcol';
            let c2 = document.createElement("tr");
            let c3 = document.createElement("tr");
            let c4 = document.createElement("tr");
            let c5 = document.createElement("tr");
            
            c1.innerHTML = `<td>${this.initial_underlying}</td>`;
            c1.innerHTML += `<td>${this.final_underlying[0]}</td>`;
            c1.innerHTML += `<td>${this.final_underlying[1]}</td>`;
            
            c2.innerHTML = `<td>${this.strike_prices[i]}</td>`;
            c3.innerHTML = `<td>${this.initial_prices[i][0]}</td>`;
            c3.innerHTML += `<td>${this.up_prices[i][0]}</td>`;
            c3.innerHTML += `<td>${this.down_prices[i][0]}</td>`;
            
            c4.innerHTML = `<td>${this.strike_prices[l-i+2]}</td>`;
            c5.innerHTML = `<td>${this.initial_prices[l-i+2][1]}</td>`;
            c5.innerHTML += `<td>${this.up_prices[l-i+2][1]}</td>`;
            c5.innerHTML += `<td>${this.down_prices[l-i+2][1]}</td>`;
            
             /*
            c1.textContent = `${this.initial_underlying}     ${this.strike_prices[i]}   ${this.initial_prices[i][0]}   ${this.strike_prices[l-i+2]}   ${this.initial_prices[l-i+2][1]}`;
            c2.textContent = `${this.final_underlying[0]}              ${this.up_prices[i][0]}             ${this.up_prices[l-i+2][1]}`;
            c3.textContent = `${this.final_underlying[1]}              ${this.down_prices[i][0]}             ${this.down_prices[l-i+2][1]}`;
              */
            
            table2.appendChild(c1); table2.appendChild(c2); table2.appendChild(c3); table2.appendChild(c4); table2.appendChild(c5);
            table.appendChild(table2);

        } // end of for loop
        
        document.getElementById("par").appendChild(table);
                    
    } // end of loadHTML function
        
} // end of pairs class
                     
                             
// Running portion of code
                     
                 
get_data(federal_funds, rf_rate);
