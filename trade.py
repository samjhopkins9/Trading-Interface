from webull import webull # for paper trading, import 'paper_webull'

wb = webull()
wb.login('+1-4154809033', 'nMzPqkPb@#BH$31') # phone must be in format +[country_code]-[your number]
wb.get_trade_token('243823')

wb.place_order(stock='SPY $443 21 Jun 23 (W) Call 100', price=0.36, qty=1)
