
let info = document.createElement('div');

info.innerHTML += `<p>Reach is given as the average largest deviation from a pricepoint within the following x minutes. The reach strategy is to set a take-profit target at some fraction of the average reach, purchasing a contract that is expected to profit from a movement smaller than the mean expected. Trading during intraday periods of heightened volatility will help this strategy as the average in the program is calculated using all times of day, and thus is reflected as something lower than the real expected value of the reach within those hours.</p>`;

info.id = "stratinfo";

function hide(){
    
    if (document.getElementById("stratinfo")){
        
        document.getElementById("maindiv").removeChild(info);
        document.getElementById("infobutton").innerHTML = `> Show Strategy Info`;
        document.getElementById("infobutton").removeEventListener("click", hide);
        document.getElementById("infobutton").addEventListener("click", show);
        
    } // end of if
    
} // end of hide function

function show () {
    
    document.getElementById("maindiv").insertBefore(info, document.querySelector("main"));
    document.getElementById("infobutton").innerHTML = `^ Hide Strategy Info`;
    document.getElementById("infobutton").removeEventListener("click", show);
    document.getElementById("infobutton").addEventListener("click", hide);
    
} // end of show function

document.getElementById('infobutton').addEventListener('click', show);

