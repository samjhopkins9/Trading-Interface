to# Trading Interface and Black-Scholes Options Price Calculator

    ## Description
    - This page displays news, a simple chart, and some basic information pertaining to a volatility of the given stock or ETF using minutely data over the last 2 weeks. It also uses the Black-Scholes formula to calculate the intrinsic price of options contracts at the underlying symbol's current price and plus or minus a certain amount after a specified amount of time decay (in minutes), with all other variables held equal. The user can adjust the minutes of time decay reflected in the prices.
    
    - The user can also adjust the implied volatility of the contracts. The time to expiry is assumed to be 1 day (since this model was largely created for the purpose of calculating fluctuations in high-volume daily contracts on ETFs), and accounts for the current time if within market hours. The risk-free interest rate is set as the current 1-month federal funds rate. A range of strike prices around the current underlying price are calculated, and appear as a table containing a similarly priced call and put with different strikes in each row.

    ## Predependencies
    - None if running in browser.
    - To run as an applicaton, electron for node.js must me installed. To install and use electron in a repository:
        * Navigate to the repository in your computer's bash terminal and type "npm install electron".
        * When that process is complete, type "npm init -v". A new electron application will be initialized in the directory.
        * When this is complete, the run command given below will open the program as a desktop application.

    ## Components
    - index.html: main HTML document
    - style.css: main CSS stylesheet
    - script.js: top-level JS script
    - optionsmath.js: script containing functions for calculating math related to stock prices
    - stratinfo.js: script containing code for strategy info panel
    - main.js: script containing code to create neutron application window for linked html document

    ## How to run
    - To run in browser, open index.html
    - To run as an application window:
        * make sure electron is installed. If not, see the above steps for installation under "predependencies", the continue with the step below.
        * navigate to the project directory in your computer's bash ternminal and type "./node_modules/.bin/electron ."

    ## License
    * GNU General Public License v3.0, Sam Hopkins, June 20, 2023. Updated June 22, 2023.
