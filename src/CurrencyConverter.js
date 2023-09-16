// CurrencyConverter.js
import React from 'react';
import Chart from 'chart.js';
import currencies from './utils/currencies';
import { checkStatus, json } from './utils/fetchUtils';

class CurrencyConverter extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(props.location.search);

    console.log(params.get('base'), params.get('quote'));


    this.state = {
      rate: 0,
      baseAcronym: params.get('base') || 'USD',
      baseValue: 0,
      quoteAcronym: params.get('quote') || 'JPY',      
      quoteValue: 0,
      loading: false,
    };

    this.chartRef = React.createRef();  //used for injecting the chart.
  }

  componentDidMount() {
    const { baseAcronym, quoteAcronym } = this.state;
    this.getRate(baseAcronym, quoteAcronym);
    this.getHistoricalRates(baseAcronym, quoteAcronym);
  }

  getRate = (base, quote) => {
    this.setState({ loading: true });
    fetch(`https://api.frankfurter.app/latest?from=${base}&to=${quote}`)
      .then(checkStatus)
      .then(json)
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }

        const rate = data.rates[quote];

        this.setState({
          rate,
          baseValue: 1,
          quoteValue: Number((1 * rate).toFixed(3)),
          loading: false,
        });
      })
      .catch(error => console.error(error.message));
  }

    //methods for building the chart, and the other for fetching the history data.
    getHistoricalRates = (base, quote) => {
        const endDate = new Date().toISOString().split('T')[0]; // turn the date format into one that is accepted by the API
        const startDate = new Date((new Date).getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
        fetch(`https://api.frankfurter.app/${startDate}..${endDate}?from=${base}&to=${quote}`)
          .then(checkStatus)
          .then(json)
          .then(data => {
            if (data.error) {
              throw new Error(data.error);
            }
    
            //Once the history data is returned, we will process it to get two arrays. One array for the dates, and the other for the rates.
            const chartLabels = Object.keys(data.rates);
            const chartData = Object.values(data.rates).map(rate => rate[quote]);
            const chartLabel = `${base}/${quote}`; //creates the label for the chart. It is a name that displays at the top of the chart to give the line some contextual meaning
            this.buildChart(chartLabels, chartData, chartLabel);
          })
          .catch(error => console.error(error.message));
        }
    
        buildChart = (labels, data, label) => {
        const chartRef = this.chartRef.current.getContext("2d");
    
        if (typeof this.chart !== "undefined") {
          this.chart.destroy();
        }
    
        this.chart = new Chart(this.chartRef.current.getContext("2d"), {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: label,
                data,
                fill: false,
                tension: 0,
              }
            ]
          },
          options: {
            responsive: true,
            }
            })
        }

  toBase(amount, rate) {
    return amount * (1 / rate);
  }

  toQuote(amount, rate) {
    return amount * rate;
  }

  convert(amount, rate, equation) {
    const input = parseFloat(amount);
    if (Number.isNaN(input)) {
      return '';
    }
    return equation(input, rate).toFixed(3);
  }

  changeBaseAcronym = (event) => {
    const baseAcronym = event.target.value;	
    this.setState({ baseAcronym });	
    this.getRate(baseAcronym, this.state.quoteAcronym);
    this.getHistoricalRates(baseAcronym, this.state.quoteAcronym);
    } //update currency selection

  changeBaseValue = (event) => {
    const quoteValue = this.convert(event.target.value, this.state.rate, this.toQuote);
    this.setState({
      baseValue: event.target.value,
      quoteValue,
    });
  } //Update base and quote inputs

  changeQuoteAcronym = (event) => {
    const quoteAcronym = event.target.value;	
    this.setState({ quoteAcronym });	
    this.getRate(this.state.baseAcronym, quoteAcronym); 
    this.getHistoricalRates(this.state.baseAcronym, quoteAcronym);
    } //update currency selection 

  changeQuoteValue = (event) => {
    const baseValue = this.convert(event.target.value, this.state.rate, this.toBase);
    this.setState({
      quoteValue: event.target.value,
      baseValue,
    });
  } //Update base and quote inputs



  render() {
    const { rate, baseAcronym, baseValue, quoteAcronym, quoteValue, loading } = this.state;

    const currencyOptions = Object.keys(currencies).map(currencyAcronym => <option key={currencyAcronym} value={currencyAcronym}>{currencyAcronym}</option>);

    return (
      <React.Fragment>
        <div className="text-center p-3">
          <h2 className="mb-2">Currency Converter</h2>
          <h4>1 {baseAcronym} to 1 {quoteAcronym} = {rate.toFixed(4)} {currencies[quoteAcronym].name}</h4>
        </div>
        <form className="form-row p-3 bg-light justify-content-center">
          <div className="form-group col-md-5 mb-0">
            <select value={baseAcronym} onChange={this.changeBaseAcronym} className="form-control form-control-lg mb-2" disabled={loading}>
              {currencyOptions}
            </select>
            <div className="input-group">
              <div className="input-group-prepend">
                <div className="input-group-text">{currencies[baseAcronym].symbol}</div>
              </div>
              <input id="base" className="form-control form-control-lg" value={baseValue} onChange={this.changeBaseValue} type="number" />
            </div>
            <small className="text-secondary">{currencies[baseAcronym].name}</small>
          </div>
          <div className="col-md-2 py-3 d-flex justify-content-center align-items-center">
            <h3>=</h3>
          </div>
          <div className="form-group col-md-5 mb-0">
            <select value={quoteAcronym} onChange={this.changeQuoteAcronym} className="form-control form-control-lg mb-2" disabled={loading}>
              {currencyOptions}
            </select>
            <div className="input-group">
              <div className="input-group-prepend">
                <div className="input-group-text">{currencies[quoteAcronym].symbol}</div>
              </div>
              <input id="quote" className="form-control form-control-lg" value={quoteValue} onChange={this.changeQuoteValue} type="number" />
            </div>
            <small className="text-secondary">{currencies[quoteAcronym].name}</small>
          </div>
        </form>
        <canvas ref={this.chartRef} />  //used for injecting the chart.
      </React.Fragment>
    )
  }
}

export default CurrencyConverter