import React, { Component } from 'react';

import Review from './Review';
import { API_URL } from '../config';

function get(url) {
  return fetch(url).then(resp => resp.json());
}

function post(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(body)
  }).then(
    resp => resp.json()
  )
}

export default class ReviewContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      author: '',
      updates: [],
      reportDate: new Date()
    };
    this.handleResolve = this.handleResolve.bind(this);
  }

  componentDidMount() {
    const { author, year, month, day } = this.props.params;
    const report = `${year}-${month}-${day}`;
    const updatesByAuthor = `${API_URL}/updates?author=${author}`;
    Promise.all([
      get(`${updatesByAuthor}&resolved=0&status=inbox`),
      get(`${updatesByAuthor}&resolved=0&status=todo&before=${report}`),
      get(`${updatesByAuthor}&report=${report}&status=done&status=todo&status=struggle`),
    ]).then(
      ([inbox, prevtodo, current]) => this.setState({
        author, reportDate: new Date(report),
        updates: [...inbox, ...prevtodo, ...current].map(
          up => Object.assign(up, {
            reportDate: new Date(up.reportDate)
          })
        )
      })
    ).catch(
      () => console.log(this.state)
    );
  }

  handleResolve(update, status, reportDate) {
    post(`${API_URL}/resolve`, {
      _id: update._id, status, reportDate
    }).then(
      created => this.setState({
        updates: this.state.updates.map(
          up => up._id === update._id ?
            Object.assign({}, created, {
              reportDate: new Date(created.reportDate)
            }) : up
        )
      })
    )
  }

  render() {
    return (
      <Review
        author={this.state.author}
        reportDate={this.state.reportDate}

        inbox={this.state.updates.filter(up => up.status === 'inbox')}
        prevtodo={this.state.updates.filter(
          up => up.status === 'todo' && up.reportDate < this.state.reportDate
        )}
        done={this.state.updates.filter(up => up.status === 'done')}
        todo={this.state.updates.filter(
          up => up.status === 'todo' &&
            up.reportDate.getTime() === this.state.reportDate.getTime()
        )}
        struggle={this.state.updates.filter(up => up.status === 'struggle')}

        handleResolve={this.handleResolve}
      />
    );
  }
}
