// function return average and sd reach over the given number of minutes for the given symbol for the whole dataset
function Reach(prices, min){
    
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
    
    vari /= r.length-1;
    
    return [avg, Math.sqrt(vari)];
    
} // end of reach function



// function to return annualized standard deviation of minutely logarithmic returns for the whole dataset
function SDreturns(prices){
    
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
    
    let ratio = prices.length/14000 // 14000 minutes in full 2-week trading period; prices.length many represented in data
    
    return (sd*Math.sqrt(ratio * 960 * 250));
    
} // end of SD_returns function



// Calculates the relative strength index over x periods for each line of data
// The relative strength index calculation most importantly involves dividing the EMA of gains by the EMA of losses, with a weighting of 1/x given towards the most recent gain or loss, for x periods of data
function RSI(prices, x){
    
    let rsi = [];
    
    for (let i=0; i<prices.length-x-1; i++){
        
        let gain_sum = 0;
        let loss_sum = 0;
        
        let last_gain = 0;
        let last_loss = 0;
        
        // for loop gets sums for calculating average gain from unit i+c+1 to unit i+1
        // loops from least to most recent, updating last gain and last loss each time a gain or loss is reached
        for (let c=x; c>0; c--){
            
            let change = prices[i+c+1] - prices[i+c];
            
            if (change > 0){
                gain_sum += change;
                last_gain = change;
            } // end of if
            
            else if (change <= 0){
                loss_sum += change/-1.0;
                last_loss = change/-1.0;
            } // end of else if
            
        } // end of for loop
        
        // if statement updates last gain or loss to be current gain or loss
        if (prices[i+1] - prices[i] > 0){
            last_gain = prices[i+1] - prices[i];
        } // end of if
        
        else if (prices[i+1] - prices[i] <= 0){
            last_loss = (prices[i+1] - prices[i])/-1.0;
        } // end of else if
        
        let avg_gains = gain_sum/x;
        let avg_losses = loss_sum/x;
        let rs = ((x-1)*avg_gains + last_gain) / ((x-1)*avg_losses + last_loss);
        
        rsi.push(100-(100/(1+rs)));
        
    } // end of for loop
    
    return rsi;
    
} // end of RSI function



// function generates a random walk over x periods
function load_randchart(x, init1){
    
    let random = [];
    let initial = init1;
    
    for (let i=0; i<x; i++){
        
        let flip = Math.floor(Math.random() * 2);
        if (flip === 0){
            
            initial -= initial*0.0005;
            
        } // end of if
        
        else {
            
            initial += initial*0.0005;
            
        } // end of else
        
        random.push(initial);
        
    } // end of for loop
    
    return random;
    
} // end of load_randchart function





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

function d1(S, K, r, sigma, T, q) {
    
    return (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    
} // end of d1 function

function d2(S, K, r, sigma, T, q) {
    
    return d1(S, K, r, sigma, T, q) - sigma * Math.sqrt(T);
    
} // end of d2 function

function black_scholes_call(S, K, r, sigma, T, q) {
                         
    let nd1 = normcdf(d1(S, K, r, sigma, T, q));
    let nd2 = normcdf(d2(S, K, r, sigma, T, q));
    return Math.abs(S * nd1 - K * Math.exp(-r * T) * nd2);
    
} // end of black_scholes_call function;

function black_scholes_put(S, K, r, sigma, T, q) {
                         
    let nd1 = normcdf(-d1(S, K, r, sigma, T, q));
    let nd2 = normcdf(-d2(S, K, r, sigma, T, q));
    return Math.abs(K * Math.exp(-r * T) * nd2 - S * nd1);
                         
} // end of black_scholes_put function

         
                     
                     
                     
// code calculating and displaying options prices with certain movements and levels of time decay
// class stores a call and put price according to a set of the 5 given parameters
class Strike {
    
    constructor(S, K, V, T, R, q){
        
        this.underlying_price = S;
        this.strike_price = K;
        this.volatility = V;
        this.time = T;
        this.riskfree_rate = R;
        this.dividend = q;
        
        this.call_price = black_scholes_call(S, K, R, V, T, q);
        this.put_price = black_scholes_put(S, K, R, V, T, q);
        
    } // end of Strike constructor
    
} // end of Strike class

                     
// function returns a list of strike prices, with corresponding calls and puts, within a specified range of prices
let ladder = (S, V, T, R, q, range) => {
        
    let l = [];
    
    let c = 0;
    for (let i=Math.floor(S)-range; i<=Math.floor(S)+range; i++){
            
        l.push(new Strike(S, i, V, T, R, q));
        // console.log(`${l[c].call_price.toFixed(2)}  ${l[c].put_price.toFixed(2)}; ${l[c].strike_price}`);
        
        c++;
            
    } // end of for loop
        
    return l;
        
} // end of ladder function
      
        
                     
// returns time to expiry in hours, given the time of day and days to expiry of a contract
let exp_time = (time, day) => {
        
    let t = day*16;
    let add = 0.0;
    let hour, minute;
        
        if (time[1] === ':'){
            
            hour = `${time[0]}`;
            minute = (time[3]) ? `${time[2]}${time[3]}` : `${time[2]}`;
        }
        
        else {
            
            hour = `${time[0]}${time[1]}`;
            minute = (time[4]) ? `${time[3]}${time[4]}` : `${time[3]}`;
            
        } // end of if else
    
    // console.log(add+t);
    add = 16.15 - (parseFloat(hour) + (parseFloat(minute)/60.0));
        
    return add+t;
        
} // end of exp_time function
      
                     
                     
// class stores pricing information for a set of call and put contracts for a symbol with specified parameters at a given price, a specified percentage higher over a certain time period, and the same lower
class Ladder {
        
    constructor(S, V, T, R, q, m, t){
        
        V /= 100; // entered as percentage
        
        this.time_exp = T / 4032.0; // entered as hours, calculated as as fraction of option trading year
        // 4032 = number of hours in a trading year = 16*252 / 7.75*252 = 1953
        this.movement = m / 100.0; // entered as a percentage
        this.time = t / 241920.0; // entered as minutes, calculated as fraction of an option trading year
        // 241920 = number of minutes in a trading year 60*16*252 / 60*7.75*252 = 117180
        
        // console.log(`Inputs: ${S}, ${Math.floor(S)}, ${V1}, ${this.time_exp}, ${R}`);
        
        this.initial_underlying = S.toFixed(2);
        this.final_underlying = [(S+(S*this.movement)).toFixed(2), (S-(S*this.movement)).toFixed(2)];
            
        this.strike_prices = [];
        this.initial_prices = [[]];
        this.up_prices = [[]];
        this.down_prices = [[]];
        
        var l0 = ladder(S, V, this.time_exp, R, q, 10);
        var l1 = ladder(S+(S*this.movement), V, this.time_exp-this.time, R, q, 10);
        var l2 = ladder(S-(S*this.movement), V, this.time_exp-this.time, R, q, 10);
        
        for (let i=0; i<l0.length; i++){
            
            for (let j=0; j<l1.length; j++){
                
                for (let k=0; k<l2.length; k++){
                    
                    if (l0[i].strike_price === l1[j].strike_price && l1[j].strike_price === l2[k].strike_price){
                        
                        this.strike_prices.push(l0[i].strike_price);
                        this.initial_prices.push([l0[i].call_price.toFixed(2), l0[i].put_price.toFixed(2)]);
                        this.up_prices.push([l1[j].call_price.toFixed(2), l1[j].put_price.toFixed(2)]);
                        this.down_prices.push([l2[k].call_price.toFixed(2), l2[k].put_price.toFixed(2)]);
                        continue;
                        
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
        head.innerHTML = `Price +/- ${(this.movement*100).toFixed(4)}% / Strike / Call Price // Strike / Put Price`;
        table.appendChild(head);
        
        let l = this.strike_prices.length;
        
        for (let i=start; i<l-end; i++){
            
            let table2 = document.createElement("table");
            table2.className = "smalltable";
            
            let c1 = document.createElement("tr");
            c1.className = 'firstcol';
            let c2 = document.createElement("tr");
            let c3 = document.createElement("tr");
            c3.className = 'pricecol';
            let c4 = document.createElement("tr");
            let c5 = document.createElement("tr");
            c5.className = 'pricecol';
            
            c1.innerHTML = `<td>${this.initial_underlying}</td>`;
            c1.innerHTML += `<td>${this.final_underlying[0]}</td>`;
            c1.innerHTML += `<td>${this.final_underlying[1]}</td>`;
            
            c2.innerHTML = `<td>${this.strike_prices[i-1]}</td>`; // offset strike price output because they were off by one in output to html
            c3.innerHTML = `<td>${this.initial_prices[i][0]}</td>`;
            c3.innerHTML += `<td>${this.up_prices[i][0]}</td>`;
            c3.innerHTML += `<td>${this.down_prices[i][0]}</td>`;
            
            c4.innerHTML = `<td>${this.strike_prices[l-i+1]}</td>`;
            c5.innerHTML = `<td>${this.initial_prices[l-i+2][1]}</td>`;
            c5.innerHTML += `<td>${this.up_prices[l-i+2][1]}</td>`;
            c5.innerHTML += `<td>${this.down_prices[l-i+2][1]}</td>`;
            c5.innerHTML += `<td>   </td>`
            
            
            table2.appendChild(c1); table2.appendChild(c2); table2.appendChild(c3); table2.appendChild(c4); table2.appendChild(c5);
            table.appendChild(table2);

        } // end of for loop
        
        document.getElementById("child").appendChild(table);
                    
    } // end of loadHTML function
        
        
} // end of pairs class
                    
