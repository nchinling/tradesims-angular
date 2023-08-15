export interface UserData {
    account_id: string
    name: string
    username: string
    email: string
    password: string


}

export interface LoginResponse {
    account_id: string
    username: string
    timestamp: string
    key: string
    cash: number
}

export interface RegisterResponse {
    account_id: string
    username: string
    timestamp: string
    status: string
    cash: number

}

export interface TradeData{

    exchange: string
    stockName: string
    symbol: string
    units: number
    price: number
    currency: string
    fee: number
    date: Date
    accountId: string
    username: string

}

export interface TradeResponse{

    account_id: string
    username: string
    exchange: string
    stockName: string
    symbol: string
    units: number
    price: number
    fee: number
    date: Date

}


export interface TradesData{

    account_id: string
    symbol: string
    stock_name: string
    exchange: string
    currency: string
    units: number
    buy_unit_price: number
    buy_total_price: number
    unit_current_price: number
    total_current_price: number
    total_return: number
    total_percentage_change: number
    datetime: Date

}


export interface PortfolioData{

    account_id: string
    symbol: string
    stock_name: string
    exchange: string
    currency: string
    units: number
    buy_unit_price: number
    buy_total_price: number
    unit_current_price: number
    total_current_price: number
    total_return: number
    total_percentage_change: number
    datetime: Date

}



export interface StockInfo {

    symbol: string
    name: string
    currency: string
    exchange: string 
    country: string
    type: string

}

export interface StockProfile {

    symbol: string
    name: string
    sector: string
    industry: string 
    ceo: string
    employees: number
    website: string
    description: string
    logoUrl: string

}

export interface Stock{
    symbol: string
    name: string
    exchange: string
    currency: string

    open: number
    high: number
    low: number
    close: number
    real_time_price: number
    volume: number
    previous_close: number
    change: number
    percent_change: number
    datetime: Date
}
