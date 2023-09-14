
// Home.js
import React from 'react';
import currencies from './utils/currencies';
import { checkStatus, json } from './utils/fetchUtils';
import CurrencyTable from './CurrencyTable';

class Home extends React.Component {
  constructor () {
    super();
    this.state = {
      base: 'USD',
      rates: null,
    }
  }

  componentDidMount() {
    this.getRatesData(this.state.base);
  }

  changeBase = (event) => {
    this.setState({ base: event.target.value });
  }

  getRatesData = (base) => {
    fetch(`https://api.frankfurter.app/latest?from=${base}`)
      .then(checkStatus)
      .then(json)
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        const rates = Object.keys(data.rates)
        .filter(acronym => acronym !== base)
        .map(acronym => ({
          acronym,
          rate: data.rates[acronym],
          name: currencies[acronym].name,
          symbol: currencies[acronym].symbol,
        }))
        
        this.setState({rates});
      })
      .catch(error => console.error(error.message));
  }

  render () {
    const { base, rates } = this.state;

    return (
      <React.Fragment>
        <form className="p-3 bg-light form-inline justify-content-center">
          <h3 className="mb-2">Base currency: <b className="mr-2">1</b></h3>
          <select value={base} onChange={this.changeBase} className="form-control form-control-lg mb-2">
            {Object.keys(currencies).map(currencyAcronym => <option key={currencyAcronym} value={currencyAcronym}>{currencyAcronym}</option>)}
          </select>
        </form>
        <CurrencyTable base={base} rates={rates} />
      </React.Fragment>
    )
  }
}

export default Home;
